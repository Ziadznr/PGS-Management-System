const mongoose = require("mongoose");
const UsersModel = require("../../models/Users/UsersModel");

const ChairmanSupervisorsListService = async (req) => {
  try {
    /* ================= AUTH ================= */
    if (!req.user || req.user.role !== "Chairman") {
      return { status: "fail", data: "Unauthorized access" };
    }

    const departmentId = req.user.department;
    const searchKeyword = req.params.searchKeyword || "0";

    if (!departmentId) {
      return { status: "fail", data: "Department not assigned" };
    }

    let matchQuery = {
      role: "Supervisor",
      department: new mongoose.Types.ObjectId(departmentId),
      isActive: true
    };

    /* ================= SEARCH ================= */
    if (searchKeyword !== "0") {
      const regex = new RegExp(searchKeyword, "i");
      matchQuery.$or = [
        { name: regex },
        { email: regex },
        { phone: regex }
      ];
    }

    const users = await UsersModel.aggregate([
      { $match: matchQuery },

      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "DepartmentData"
        }
      },
      {
        $unwind: {
          path: "$DepartmentData",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $sort: { name: 1 }
      },

      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          subject: 1,
          DepartmentName: "$DepartmentData.name"
        }
      }
    ]);

    return {
      status: "success",
      data: users
    };

  } catch (error) {
    console.error("ChairmanSupervisorsListService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = ChairmanSupervisorsListService;
