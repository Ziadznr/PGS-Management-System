const ParentModel = require('../../models/Purchases/PurchasesModel');
const ChildsModel = require('../../models/Purchases/PurchasesProductsModel');
const ProductsModel = require('../../models/Products/ProductsModel');
const SuppliersModel = require('../../models/Suppliers/SuppliersModel');
const CreateParentChildsService = require('../../services/common/CreateParentChildsService');
const DeleteParentChildsService = require('../../services/common/DeleteParentChildsService');
const PurchasesReportService = require('../../services/report/PurchaseReportService');
const PurchaseSummeryService = require('../../services/summery/PurchaseSummeryService');
const mongoose = require('mongoose');

// ---------------- CREATE PURCHASE ----------------
exports.CreatePurchases = async (req, res) => {
    try {
        const Result = await CreateParentChildsService(req, ParentModel, ChildsModel, 'PurchaseID');

        if (Result.status === 'success' && Result.data?.Childs?.length > 0) {
            for (const child of Result.data.Childs) {
                await ProductsModel.findByIdAndUpdate(
                    child.ProductID,
                    { $inc: { Stock: child.Qty } },
                    { new: true }
                );
            }
        }

        res.status(200).json(Result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// ---------------- UPDATE PURCHASE ----------------
exports.UpdatePurchase = async (req, res) => {
    try {
        const purchaseID = req.params.id;
        const newChilds = req.body.Childs;

        const oldChilds = await ChildsModel.find({ PurchaseID: purchaseID });

        for (const oldChild of oldChilds) {
            const newChild = newChilds.find(c => c.ProductID === oldChild.ProductID.toString());
            if (newChild) {
                const diff = newChild.Qty - oldChild.Qty;
                if (diff !== 0) {
                    await ProductsModel.findByIdAndUpdate(
                        oldChild.ProductID,
                        { $inc: { Stock: diff } },
                        { new: true }
                    );
                }
            }
        }

        const Result = await CreateParentChildsService(req, ParentModel, ChildsModel, 'PurchaseID');
        res.status(200).json(Result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// ---------------- LIST PURCHASES ----------------
exports.PurchasesList = async (req, res) => {
  try {
    console.log("===== PurchasesList Called =====");
    const searchKeyword = req.params.searchKeyword || "0";
    console.log("Search Keyword:", searchKeyword);

    const SearchRgx = { $regex: searchKeyword, $options: "i" };

    // Lookup supplier
    const JoinSupplier = {
      $lookup: {
        from: "suppliers",
        localField: "SupplierID",
        foreignField: "_id",
        as: "supplier"
      }
    };

    // Lookup purchased products
    const JoinProducts = {
      $lookup: {
        from: "purchasesproducts",
        localField: "_id",
        foreignField: "PurchaseID",
        as: "products"
      }
    };

    // Unwind products array
    const UnwindProducts = { $unwind: { path: "$products", preserveNullAndEmptyArrays: true } };

    // Lookup product info
    const JoinProductInfo = {
      $lookup: {
        from: "products",
        localField: "products.ProductID",
        foreignField: "_id",
        as: "products.ProductInfo"
      }
    };

    // Group products back per purchase with dynamic total calculation
    const GroupProducts = {
      $group: {
        _id: "$_id",
        Supplier: { $first: "$supplier" },
        VatTax: { $first: "$VatTax" },
        Discount: { $first: "$Discount" },
        OtherCost: { $first: "$OtherCost" },
        ShippingCost: { $first: "$ShippingCost" },
        GrandTotal: { $first: "$GrandTotal" },
        Note: { $first: "$Note" },
        CreatedDate: { $first: "$CreatedDate" },
        Products: {
          $push: {
            ProductName: { $ifNull: [{ $arrayElemAt: ["$products.ProductInfo.Name", 0] }, "-"] },
            Qty: { $ifNull: ["$products.Qty", 0] },
            UnitCost: { $ifNull: ["$products.UnitCost", 0] },
            Total: { $multiply: [
              { $ifNull: ["$products.Qty", 0] },
              { $ifNull: ["$products.UnitCost", 0] }
            ]}
          }
        }
      }
    };

    // Match stage for search
    const MatchStage = searchKeyword !== "0" ? {
      $match: {
        $or: [
          { Note: SearchRgx },
          { "supplier.Name": SearchRgx }
        ]
      }
    } : null;

    const pipeline = [
      JoinSupplier,
      JoinProducts,
      UnwindProducts,
      JoinProductInfo,
      GroupProducts,
      ...(MatchStage ? [MatchStage] : [])
    ];

    console.log("Aggregation pipeline stages set up");

    const rawResult = await ParentModel.aggregate(pipeline);
    console.log("Raw aggregation result:", JSON.stringify(rawResult, null, 2));

    // Map data to frontend-friendly structure
    const Data = rawResult.map(purchase => ({
      ...purchase,
      SupplierName: purchase.Supplier?.[0]?.Name || "-",
      Products: purchase.Products.map(p => ({
        ProductName: p.ProductName,
        Qty: p.Qty,
        UnitCost: p.UnitCost,
        Total: p.Total
      }))
    }));

    console.log("Mapped Data:", JSON.stringify(Data, null, 2));

    res.status(200).json({ status: "success", data: Data, total: Data.length });
  } catch (error) {
    console.error("PurchasesList Error:", error);
    res.status(500).json({ status: "error", message: error.toString() });
  }
};


// ---------------- DELETE PURCHASE ----------------
exports.PurchasesDelete = async (req, res) => {
    try {
        const purchaseID = req.params.id;
        const childProducts = await ChildsModel.find({ PurchaseID: purchaseID });

        for (const child of childProducts) {
            await ProductsModel.findByIdAndUpdate(
                child.ProductID,
                { $inc: { Stock: -child.Qty } },
                { new: true }
            );
        }

        const Result = await DeleteParentChildsService(req, ParentModel, ChildsModel, 'PurchaseID');
        res.status(200).json(Result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// ---------------- PURCHASES REPORT ----------------
exports.PurchasesByDate = async (req, res) => {
    try {
        const Result = await PurchasesReportService(req);
        res.status(200).json(Result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// ---------------- PURCHASE SUMMARY ----------------
exports.PurchaseSummery = async (req, res) => {
    try {
        const Result = await PurchaseSummeryService(req);
        res.status(200).json(Result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
