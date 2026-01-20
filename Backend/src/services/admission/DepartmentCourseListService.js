const DepartmentLastSemesterCourseModel =
  require("../../models/Admission/DepartmentLastSemesterCourseModel");

const DepartmentCourseListService = async (req) => {
  try {
    const chairman = req.user;

    // ================= AUTH =================
    if (!chairman || chairman.role !== "Chairman") {
      return { status: "fail", data: "Unauthorized access" };
    }

    const record =
      await DepartmentLastSemesterCourseModel.findOne({
        department: chairman.department
      }).lean();

    return {
      status: "success",
      data: record || null   // null if not created yet
    };

  } catch (error) {
    console.error("DepartmentCourseListService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = DepartmentCourseListService;
