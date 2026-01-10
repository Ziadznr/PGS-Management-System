const mongoose = require("mongoose");
const CustomersProductEntryModel = require("../../models/Users/CustomersProductEntryModel");

const CustomerProductReportService = async (req) => {
  try {
    const { FromDate, ToDate, FacultyID, DepartmentID, SectionID, CustomerID, Category } = req.body;

    if (!FromDate || !ToDate) {
      return { status: "error", message: "FromDate and ToDate are required" };
    }

    const match = {
      CreatedDate: {
        $gte: new Date(FromDate),
        $lte: new Date(new Date(ToDate).setHours(23, 59, 59, 999)),
      },
    };

    const isValidObjectId = (id) => id && mongoose.Types.ObjectId.isValid(id);
    if (isValidObjectId(CustomerID)) match.CustomerID = new mongoose.Types.ObjectId(CustomerID);

    // Base pipeline
    const pipeline = [{ $match: match }];

    // Lookup customer
    pipeline.push({
      $lookup: {
        from: "customers",
        localField: "CustomerID",
        foreignField: "_id",
        as: "customer",
      },
    });
    pipeline.push({ $unwind: "$customer" });

    // 🔹 Filter based on selection
    if (Category === "Dean" && isValidObjectId(FacultyID)) {
      pipeline.push({ $match: { "customer.Faculty": new mongoose.Types.ObjectId(FacultyID) } });
    } else if ((Category === "Chairman" || Category === "Teacher") && isValidObjectId(FacultyID) && isValidObjectId(DepartmentID)) {
      pipeline.push({
        $match: {
          "customer.Faculty": new mongoose.Types.ObjectId(FacultyID),
          "customer.Department": new mongoose.Types.ObjectId(DepartmentID),
        },
      });
    } else if (Category === "Officer" && isValidObjectId(SectionID)) {
      pipeline.push({ $match: { "customer.Section": new mongoose.Types.ObjectId(SectionID) } });
    } else if (isValidObjectId(FacultyID) && !DepartmentID) {
      // Faculty only filter (no department)
      pipeline.push({ $match: { "customer.Faculty": new mongoose.Types.ObjectId(FacultyID) } });
    } else if (isValidObjectId(FacultyID) && isValidObjectId(DepartmentID)) {
      // Faculty + Department
      pipeline.push({
        $match: {
          "customer.Faculty": new mongoose.Types.ObjectId(FacultyID),
          "customer.Department": new mongoose.Types.ObjectId(DepartmentID),
        },
      });
    } else if (isValidObjectId(SectionID)) {
      // Section only
      pipeline.push({ $match: { "customer.Section": new mongoose.Types.ObjectId(SectionID) } });
    }

    // Lookups for names
    pipeline.push(
      {
        $lookup: { from: "faculties", localField: "customer.Faculty", foreignField: "_id", as: "facultyDetails" },
      },
      { $unwind: { path: "$facultyDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: { from: "departments", localField: "customer.Department", foreignField: "_id", as: "departmentDetails" },
      },
      { $unwind: { path: "$departmentDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: { from: "sections", localField: "customer.Section", foreignField: "_id", as: "sectionDetails" },
      },
      { $unwind: { path: "$sectionDetails", preserveNullAndEmptyArrays: true } }
    );

    // Unwind products
    pipeline.push({ $unwind: "$Products" });

    // Lookup product details
    pipeline.push(
      {
        $lookup: { from: "products", localField: "Products.ProductName", foreignField: "Name", as: "productDetails" },
      },
      { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: { from: "brands", localField: "productDetails.BrandID", foreignField: "_id", as: "brands" },
      },
      {
        $lookup: { from: "categories", localField: "productDetails.CategoryID", foreignField: "_id", as: "categories" },
      }
    );

    // Group
    pipeline.push({
      $group: {
        _id: "$_id",
        CustomerName: { $first: "$customer.CustomerName" },
        PurchaseDate: { $first: "$PurchaseDate" },
        Total: { $first: "$Total" },
        Products: { $push: "$Products" },
        FacultyName: { $first: "$facultyDetails.Name" },
        DepartmentName: { $first: "$departmentDetails.Name" },
        SectionName: { $first: "$sectionDetails.Name" },
        Rows: { $push: { Products: "$Products", brands: "$brands", categories: "$categories" } },
      },
    });

    // Total sum and rows
    pipeline.push({
      $facet: {
        Total: [{ $group: { _id: null, TotalAmount: { $sum: "$Total" } } }],
        Rows: [{ $project: { CustomerName: 1, PurchaseDate: 1, Total: 1, Products: 1, Rows: 1, FacultyName: 1, DepartmentName: 1, SectionName: 1 } }],
      },
    });

    const data = await CustomersProductEntryModel.aggregate(pipeline);

    return { status: "success", data };
  } catch (error) {
    console.error("CustomerProductReportService Error:", error);
    return { status: "error", message: error.message || "An error occurred" };
  }
};

module.exports=CustomerProductReportService;