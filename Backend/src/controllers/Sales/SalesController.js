const ParentModel = require('../../models/Sales/SalesModel');
const ChildsModel = require('../../models/Sales/SalesProductsModel');
const CreateParentChildsService = require('../../services/common/CreateParentChildsService');
const ListOneJoinService = require('../../services/common/ListOneJoinService');
const DeleteParentChildsService = require('../../services/common/DeleteParentChildsService');
const SalesReportService = require('../../services/report/SalesReportService');
const SalesSummeryService = require('../../services/summery/SalesSummeryService');
const SendEmailUtility = require('../../utility/SendEmailUtility');
const CustomersModel = require('../../models/Users/UsersModel'); // ✅ import email utility
const ReturnsProductsModel = require('../../models/Returns/ReturnsProductsModel');

exports.CreateSales = async (req, res) => {
  try {
    // 1️⃣ Create sale and child products
    const Result = await CreateParentChildsService(req, ParentModel, ChildsModel, 'SaleID');
    console.log("✅ Sale created:", Result);

    // 2️⃣ Fetch customer using the ID inside Parent
    const CustomerID = req.body?.Parent?.CustomerID;
    if (!CustomerID) {
      console.warn("⚠️ CustomerID not provided in request body");
    }

    const CustomerData = CustomerID
      ? await CustomersModel.findById(CustomerID).lean()
      : null;

    console.log("📌 Fetched customer data:", CustomerData);

    // 3️⃣ Send email if email exists
    if (CustomerData?.CustomerEmail) {
      const EmailTo = CustomerData.CustomerEmail;
      const EmailSubject = '📢 New Sale Created - Notification';
      const EmailText = `
Hello ${CustomerData.CustomerName || "Customer"},

Your purchase has been successfully recorded.

💰 Grand Total: $${req.body?.Parent?.GrandTotal || 0}
🗓 Date: ${new Date().toLocaleDateString()}

Thank you for your business!
      `;

      console.log("📧 Sending email to:", EmailTo);
      await SendEmailUtility(EmailTo, EmailText, EmailSubject);
      console.log("✅ Email sent successfully!");
    } else {
      console.warn("⚠️ Customer email not found, skipping email.");
    }

    res.status(200).json(Result);
  } catch (error) {
    console.error("CreateSales Error:", error);
    res.status(500).json({ status: "error", message: error.toString() });
  }
};


exports.SalesList = async (req, res) => {
  try {
    const { pageNo = 1, perPage = 20, searchKeyword = "0" } = req.params;
    const SearchRgx = { $regex: searchKeyword, $options: "i" };

    // 🔹 Determine logged-in user email from headers
    const email = req.headers.email || null;

    // 🔹 Get CustomerID if it's a customer
    let customerIdFilter = null;
    if (email) {
      const customer = await CustomersModel.findOne({ CustomerEmail: email }).lean();
      if (customer) customerIdFilter = customer._id;
      console.log("CustomerID filter:", customerIdFilter);
    }

    // 🔹 Build aggregation pipeline
    const pipeline = [
      { $match: customerIdFilter ? { CustomerID: customerIdFilter } : {} },

      // Join customers
      { $lookup: { from: "customers", localField: "CustomerID", foreignField: "_id", as: "customers" } },
      { $unwind: { path: "$customers", preserveNullAndEmptyArrays: true } },

      // Search filter
      {
        $match: {
          $or: [
            { Note: SearchRgx },
            { "customers.CustomerName": SearchRgx },
            { "customers.Phone": SearchRgx },
            { "customers.CustomerEmail": SearchRgx },
            { SlipNo: SearchRgx },
          ],
        },
      },

      // Join faculty/department/section safely
      { $lookup: { from: "faculties", localField: "customers.Faculty", foreignField: "_id", as: "faculty" } },
      { $lookup: { from: "departments", localField: "customers.Department", foreignField: "_id", as: "department" } },
      { $lookup: { from: "sections", localField: "customers.Section", foreignField: "_id", as: "section" } },

      // Join sales products
      { $lookup: { from: "salesproducts", localField: "_id", foreignField: "SaleID", as: "salesProducts" } },
      { $lookup: { from: "products", localField: "salesProducts.ProductID", foreignField: "_id", as: "productDetails" } },

      // Sort, skip, limit
      { $sort: { CreatedDate: -1 } },
      { $skip: (parseInt(pageNo) - 1) * parseInt(perPage) },
      { $limit: parseInt(perPage) },
    ];

    const Result = await ParentModel.aggregate(pipeline);

    // 🔹 Format data
    const Data = await Promise.all(
      Result.map(async (sale) => {
        const customer = sale.customers || {};
        const Products = await Promise.all(
          sale.salesProducts.map(async (sp) => {
            const productDetail = sale.productDetails.find(pd => pd._id.toString() === sp.ProductID.toString());
            const returned = await ReturnsProductsModel.aggregate([
              { $match: { Source: "sale", SaleID: sale._id, ProductID: sp.ProductID } },
              { $group: { _id: null, totalReturned: { $sum: "$Qty" } } },
            ]);
            const totalReturned = returned[0]?.totalReturned || 0;
            return {
              ProductName: productDetail?.Name || "-",
              Qty: sp.Qty,
              UnitCost: sp.UnitCost,
              Total: sp.Total,
              ProductID: sp.ProductID,
              AvailableQty: Math.max(sp.Qty - totalReturned, 0),
            };
          })
        );

        return {
          _id: sale._id,
          SlipNo: sale.SlipNo || "-",
          OtherCost: sale.OtherCost || 0,
          GrandTotal: sale.GrandTotal || 0,
          Note: sale.Note || "",
          CreatedDate: sale.CreatedDate,
          CustomerData: {
            CustomerName: customer.CustomerName || "-",
            Category: customer.Category || "-",
            FacultyName: sale.faculty?.[0]?.Name || "-",
            DepartmentName: sale.department?.[0]?.Name || "-",
            SectionName: sale.section?.[0]?.Name || "-",
            Email: customer.CustomerEmail || "-",
            Phone: customer.Phone || "-",
          },
          Products: Products.filter(p => p.ProductName !== "-"),
        };
      })
    );

    // 🔹 Total count
    const countPipeline = [
      { $match: customerIdFilter ? { CustomerID: customerIdFilter } : {} },
      { $count: "total" },
    ];
    const totalCountResult = await ParentModel.aggregate(countPipeline);
    const totalCount = totalCountResult[0]?.total || 0;

    res.status(200).json({ status: "success", data: Data, total: totalCount });
  } catch (error) {
    console.error("SalesList Error:", error);
    res.status(500).json({ status: "error", message: error.toString() });
  }
};


exports.SalesDelete = async (req, res) => {
    let Result = await DeleteParentChildsService(req, ParentModel, ChildsModel, 'SaleID');
    res.status(200).json(Result);
}

exports.SalesByDate = async (req, res) => {
    let Result = await SalesReportService(req);
    res.status(200).json(Result);
}

exports.SaleSummery= async (req, res) => {
    let Result = await SalesSummeryService(req);
    res.status(200).json(Result);
}
