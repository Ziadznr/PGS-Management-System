const mongoose = require("mongoose");

const ListService = async (
  req,
  DataModel,
  SearchArray = [],
  MatchQuery = {}
) => {
  try {
    /* ================= PAGINATION ================= */
    const pageNo = Number(req.params.pageNo) || 1;
    const perPage = Number(req.params.perPage) || 20;
    const searchKeyword = req.params.searchKeyword || "0";
    const skipRow = (pageNo - 1) * perPage;

    /* ================= BASE MATCH ================= */
    let matchStage = {
      ...MatchQuery,
      isActive: true // ✅ only active users
    };

    /* ================= ROLE-BASED ACCESS ================= */

    // 🎓 Student → can only see self
    if (req.user.role === "Student") {
      matchStage.email = req.user.email;
    }

    // 🏫 Chairman / Supervisor → only own department
    if (
      ["Chairman", "Supervisor"].includes(req.user.role) &&
      req.user.department
    ) {
      matchStage.department = new mongoose.Types.ObjectId(
        req.user.department
      );
    }

    // 🏠 Provost → only own hall
    if (req.user.role === "Provost" && req.user.hall) {
      matchStage.hall = new mongoose.Types.ObjectId(req.user.hall);
    }

    /* ================= SEARCH ================= */
    if (searchKeyword !== "0" && SearchArray.length > 0) {
      matchStage.$or = SearchArray;
    }

    /* ================= AGGREGATION ================= */
    const data = await DataModel.aggregate([
      { $match: matchStage },

      /* ================= DEPARTMENT LOOKUP ================= */
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

      /* ================= HALL LOOKUP ================= */
      {
        $lookup: {
          from: "halls",
          localField: "hall",
          foreignField: "_id",
          as: "HallData"
        }
      },
      {
        $unwind: {
          path: "$HallData",
          preserveNullAndEmptyArrays: true
        }
      },

      /* ================= RESULT ================= */
      {
        $facet: {
          Total: [{ $count: "count" }],
          Rows: [
            { $skip: skipRow },
            { $limit: perPage },
            {
              $project: {
                name: 1,
                nameExtension: 1,
                email: 1,
                phone: 1,
                role: 1,
                subject: 1,

                // 🎯 Display helpers
                DepartmentName: "$DepartmentData.name",
                HallName: "$HallData.name"
              }
            }
          ]
        }
      }
    ]);

    /* ================= SAFE RESPONSE ================= */
    const result = data[0] || { Total: [], Rows: [] };

    if (!result.Total.length) {
      result.Total = [{ count: 0 }];
    }

    return {
      status: "success",
      data: [result]
    };

  } catch (error) {
    console.error("ListService error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = ListService;
