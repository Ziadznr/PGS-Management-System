const mongoose = require('mongoose');
const ParentModel = require('../../models/Returns/ReturnsModel');
const ChildsModel = require('../../models/Returns/ReturnsProductsModel');
const CreateParentChildsService = require('../../services/common/CreateParentChildsService');
const DeleteParentChildsService = require('../../services/common/DeleteParentChildsService');
const ProductDropDownService = require("../../services/Return/ProductDropdownService");

const SaleModel = require("../../models/Sales/SalesModel");
const SalesProductsModel = require("../../models/Sales/SalesProductsModel");
const CustomersProductEntryModel = require("../../models/Users/CustomersProductEntryModel");
const CustomerModel = require("../../models/Users/UsersModel");

// ---------------- CREATE RETURN ----------------
exports.CreateReturns = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Parent, Childs } = req.body;
    console.log("📌 Request body:", req.body);

    if (!Parent) return res.status(400).json({ status: "fail", message: "Parent data is required" });

    const { CustomerID, SaleID, CustomerProductEntryID, Reason, GivenDate, UserEmail, SlipNo } = Parent;
    const Products = Childs;

    console.log("📌 Extracted Parent:", Parent);
    console.log("📌 Extracted Products:", Products);

    if (!CustomerID) return res.status(400).json({ status: "fail", message: "CustomerID is required" });
    if (!Products || !Array.isArray(Products) || Products.length === 0)
      return res.status(400).json({ status: "fail", message: "At least 1 product is required for return" });

    // 1️⃣ Create main return document
    const newReturn = await ParentModel.create([{
      CustomerID,
      SaleID,
      CustomerProductEntryID,
      Reason,
      GivenDate,
      UserEmail,
      SlipNo: SlipNo || null   // Save SlipNo if provided
    }], { session });

    const ReturnID = newReturn[0]._id;
    console.log("✅ Created Return:", newReturn[0]);

    // 2️⃣ Process each product
    for (const item of Products) {
      let { ProductID, Qty, Source, ProductName } = item;
      console.log("📌 Processing product:", item);

      // If ProductID is missing, try to fetch it from source by name
      if (!ProductID) {
        if (Source === "sale" && SaleID) {
          const saleProduct = await SalesProductsModel.findOne({ SaleID, ProductName }).lean();
          ProductID = saleProduct?._id;
        } else if (Source === "customerEntry" && CustomerProductEntryID) {
          const entry = await CustomersProductEntryModel.findById(CustomerProductEntryID).lean();
          const prod = entry?.Products?.find(p => p.ProductName === ProductName);
          ProductID = prod?._id;
        }
      }

      // Save return product
      await ChildsModel.create([{
        UserEmail,
        ReturnID,
        ProductID,
        ProductName,
        Qty,
        Source
      }], { session });

      // Decrement AvailableQty in source collection if ProductID exists
      if (ProductID) {
        if (Source === "sale" && SaleID) {
          await SalesProductsModel.updateOne(
            { SaleID, _id: ProductID },
            { $inc: { AvailableQty: -Qty } },
            { session }
          );
        }

        if (Source === "customerEntry" && CustomerProductEntryID) {
          await CustomersProductEntryModel.updateOne(
            { _id: CustomerProductEntryID, "Products._id": ProductID },
            { $inc: { "Products.$.AvailableQty": -Qty } },
            { session }
          );
        }
      }
    }

    await session.commitTransaction();
    session.endSession();

    console.log("✅ Return created and quantities updated successfully");
    res.status(201).json({
      status: "success",
      message: "Return created and quantities updated successfully",
      data: newReturn[0]
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ CreateReturns Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ---------------- RETURN LIST ----------------
exports.ReturnList = async (req, res) => {
  try {
    const searchKeyword = req.params.searchKeyword || "";
    console.log("📌 ReturnList searchKeyword:", searchKeyword);

    const Result = await ParentModel.aggregate([
      { $lookup: { from: "customers", localField: "CustomerID", foreignField: "_id", as: "customer" } },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "faculties", localField: "customer.Faculty", foreignField: "_id", as: "faculty" } },
      { $unwind: { path: "$faculty", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "departments", localField: "customer.Department", foreignField: "_id", as: "department" } },
      { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "sections", localField: "customer.Section", foreignField: "_id", as: "section" } },
      { $unwind: { path: "$section", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "returnsproducts", localField: "_id", foreignField: "ReturnID", as: "products" } },
      {
        $match: {
          $or: [
            { Reason: { $regex: searchKeyword, $options: "i" } },
            { "customer.CustomerName": { $regex: searchKeyword, $options: "i" } },
            { "customer.Phone": { $regex: searchKeyword, $options: "i" } }
          ]
        }
      }
    ]);

    const Data = await Promise.all(Result.map(async returnDoc => {
      const customer = returnDoc.customer || {};

      // Determine SlipNo: stored or fallback
      let slipNo = returnDoc.SlipNo || "No Slip";
      if (slipNo === "No Slip") {
        if (returnDoc.SaleID) {
          const sale = await SaleModel.findById(returnDoc.SaleID).lean();
          slipNo = sale?.SlipNo || "No Slip";
        } else if (returnDoc.CustomerProductEntryID) {
          const entry = await CustomersProductEntryModel.findById(returnDoc.CustomerProductEntryID).lean();
          slipNo = entry?.PayslipNumber || "No Slip";
        }
      }

      // Compute AvailableQty for each returned product
      const products = await Promise.all((returnDoc.products || []).map(async p => {
        let originalQty = 0;

        // If ProductID missing, try to fetch by name
        if (!p.ProductID) {
          if (p.Source === "sale" && returnDoc.SaleID) {
            const saleProduct = await SalesProductsModel.findOne({ SaleID: returnDoc.SaleID, ProductName: p.ProductName }).lean();
            p.ProductID = saleProduct?._id;
            originalQty = saleProduct?.Qty || 0;
          } else if (p.Source === "customerEntry" && returnDoc.CustomerProductEntryID) {
            const entry = await CustomersProductEntryModel.findById(returnDoc.CustomerProductEntryID).lean();
            const prod = entry?.Products?.find(pr => pr.ProductName === p.ProductName);
            p.ProductID = prod?._id;
            originalQty = prod?.Qty || 0;
          }
        } else {
          // Normal flow if ProductID exists
          if (p.Source === "sale") {
            const saleProduct = await SalesProductsModel.findById(p.ProductID).lean();
            originalQty = saleProduct?.Qty || 0;
          } else if (p.Source === "customerEntry" && returnDoc.CustomerProductEntryID) {
            const entry = await CustomersProductEntryModel.findById(returnDoc.CustomerProductEntryID).lean();
            const prod = entry?.Products?.find(pr => pr._id?.toString() === p.ProductID?.toString());
            originalQty = prod?.Qty || 0;
          }
        }

        // Total returned for this product
        const agg = await ChildsModel.aggregate([
          { $match: { ProductID: p.ProductID, ReturnID: returnDoc._id } },
          { $group: { _id: null, sumQty: { $sum: "$Qty" } } }
        ]);
        const totalReturned = agg.length ? agg[0].sumQty : 0;

        return {
          ProductName: p.ProductName,
          Qty: p.Qty,
          AvailableQty: Math.max(originalQty - totalReturned, 0)
        };
      }));

      return {
        ...returnDoc,
        SlipNo: slipNo,
        Products: products,
        CustomerData: {
          CustomerName: customer.CustomerName || "-",
          Category: customer.Category || "-",
          FacultyName: returnDoc.faculty?.Name || "-",
          DepartmentName: returnDoc.department?.Name || "-",
          SectionName: returnDoc.section?.Name || "-"
        }
      };
    }));

    console.log("✅ ReturnList Data prepared:", Data);
    res.status(200).json({ status: "success", data: Data });
  } catch (error) {
    console.error("❌ ReturnList Error:", error);
    res.status(500).json({ status: "error", message: error.toString() });
  }
};



// ---------------- DELETE RETURN ----------------
exports.ReturnsDelete = async (req, res) => {
  try {
    let Result = await DeleteParentChildsService(req, ParentModel, ChildsModel, 'ReturnID');
    res.status(200).json(Result);
  } catch (error) {
    console.error("❌ ReturnsDelete Error:", error);
    res.status(500).json({ status: "error", message: error.toString() });
  }
};

// ---------------- RETURN SLIP & PRODUCTS ----------------
exports.ReturnProductsDropdown = async (req, res) => {
  try {
    const { customerId, slipNo } = req.query;
    if (!customerId || !slipNo) return res.status(400).json({ status: 'error', message: 'CustomerID and SlipNo are required' });

    const products = await ProductDropDownService(customerId, slipNo);
    const availableProducts = products.filter(p => p.Qty > 0);

    res.status(200).json({ status: 'success', data: availableProducts });
  } catch (error) {
    console.error("❌ ReturnProductsDropdown Error:", error);
    res.status(500).json({ status: 'error', message: error.toString() });
  }
};

exports.ReturnSlipDropdown = async (req, res) => {
  try {
    const customerId = req.query.customerId;
    if (!customerId) return res.status(400).json({ status: "error", message: "CustomerID is required" });

    const slipsFromSales = await SaleModel.find({ CustomerID: customerId }).distinct("SlipNo");
    const slipsFromCustomerEntry = await CustomersProductEntryModel.find({ CustomerID: customerId }).distinct("PayslipNumber");

    const allSlips = Array.from(new Set([...slipsFromSales, ...slipsFromCustomerEntry]));
    res.status(200).json({ status: "success", data: allSlips });
  } catch (error) {
    console.error("❌ ReturnSlipDropdown Error:", error);
    res.status(500).json({ status: "error", message: error.toString() });
  }
};

// 🔹 Returns Report by Date
exports.ReturnByDate = async (req, res) => {
  try {
    let Result = await ReturnReportService(req);
    res.status(200).json(Result);
  } catch (error) {
    console.error("❌ ReturnByDate Error:", error);
    res.status(500).json({ status: "error", message: error.toString() });
  }
};

// 🔹 Returns Summary
// exports.ReturnSummery = async (req, res) => {
//   try {
//     let Result = await ReturnSummeryService(req);
//     res.status(200).json(Result);
//   } catch (error) {
//     console.error("❌ ReturnSummery Error:", error);
//     res.status(500).json({ status: "error", message: error.toString() });
//   }
// };

