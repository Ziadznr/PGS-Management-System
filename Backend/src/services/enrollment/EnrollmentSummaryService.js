const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const EnrollmentSummaryService = async () => {
  try {
    const data = await AdmissionApplicationModel.aggregate([
      {
        $match: { applicationStatus: "Enrolled" }
      },
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "department"
        }
      },
      { $unwind: "$department" },
      {
        $group: {
          _id: "$department._id",
          departmentName: { $first: "$department.name" },
          totalEnrolled: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          departmentName: 1,
          totalEnrolled: 1
        }
      },
      { $sort: { departmentName: 1 } }
    ]);

    return { status: "success", data };

  } catch (error) {
    console.error("EnrollmentSummaryService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = EnrollmentSummaryService;
