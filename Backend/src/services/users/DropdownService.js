const mongoose = require('mongoose');

const DropDownService = async (req, DataModel, Projection) => {
  try {
    const filter = {};

    // ---------------- Validate ObjectId helper ----------------
    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

    // ---------------- Fetch by ID ----------------
    if (req.query.id && isValidObjectId(req.query.id)) {
      filter._id = new mongoose.Types.ObjectId(req.query.id);
    }

    // ---------------- Role-based filtering (Users only) ----------------
    const allowedRoles = ["Dean", "Chairman", "Supervisor", "Student"];

    if (
      req.query.role &&
      req.query.role !== "All" &&
      allowedRoles.includes(req.query.role)
    ) {
      filter.role = req.query.role;
    }

    // ---------------- Department-based filtering ----------------
    if (req.query.departmentID && isValidObjectId(req.query.departmentID)) {
      filter.department = new mongoose.Types.ObjectId(req.query.departmentID);
    }

    const data = await DataModel.aggregate([
      { $match: filter },
      { $project: Projection }
    ]);

    return { status: 'success', data };

  } catch (error) {
    console.error("DropDownService error:", error);
    return { status: 'fail', data: error.toString() };
  }
};

module.exports = DropDownService;
