const mongoose = require('mongoose');

const ListService = async (
  req,
  DataModel,
  SearchArray = [],
  MatchQuery = {}
) => {
  try {
    let pageNo = Number(req.params.pageNo) || 1;
    let perPage = Number(req.params.perPage) || 20;
    const searchKeyword = req.params.searchKeyword || "0";
    const skipRow = (pageNo - 1) * perPage;

    if (pageNo < 1) pageNo = 1;
    if (perPage < 1) perPage = 20;

    let matchStage = { ...MatchQuery };

    // ---------------- Role-based filtering ----------------
    // Student sees only own data
    if (req.user.role === "Student") {
      matchStage.email = req.user.email;
    }

    // Chairman & Supervisor see users from their department
    if (
      ["Chairman", "Supervisor"].includes(req.user.role) &&
      req.user.department
    ) {
      matchStage.department = new mongoose.Types.ObjectId(req.user.department);
    }

    // Dean sees everything (no extra filter)

    // ---------------- Search filter ----------------
    if (searchKeyword !== "0" && SearchArray.length > 0) {
      matchStage.$or = SearchArray;
    }

    const data = await DataModel.aggregate([
      { $match: matchStage },

      // ---------------- Department Lookup ----------------
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "DepartmentData"
        }
      },
      { $unwind: { path: "$DepartmentData", preserveNullAndEmptyArrays: true } },

      // ---------------- Faculty Lookup (via Department) ----------------
      {
        $lookup: {
          from: "faculties",
          localField: "DepartmentData.faculty",
          foreignField: "_id",
          as: "FacultyData"
        }
      },
      { $unwind: { path: "$FacultyData", preserveNullAndEmptyArrays: true } },

      // ---------------- Pagination ----------------
      {
        $facet: {
          Total: [{ $count: "count" }],
          Rows: [
            { $skip: skipRow },
            { $limit: perPage },
            {
              $project: {
                name: 1,
                email: 1,
                role: 1,
                phone: 1,
                DepartmentName: "$DepartmentData.name",
                FacultyName: "$FacultyData.name"
              }
            }
          ]
        }
      }
    ]);

    let result = data[0] || { Total: [], Rows: [] };
    if (!result.Total.length) {
      result.Total = [{ count: 0 }];
    }

    return { status: "success", data: [result] };

  } catch (error) {
    console.error("ListService error:", error);
    return { status: "fail", data: error.toString() };
  }
};

module.exports = ListService;
