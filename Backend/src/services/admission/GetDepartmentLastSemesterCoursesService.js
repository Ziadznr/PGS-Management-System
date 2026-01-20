const DepartmentLastSemesterCourseModel =
  require("../../models/Admission/DepartmentLastSemesterCourseModel");

const GetDepartmentLastSemesterCoursesService = async (req) => {
  try {
    const { departmentId } = req.params;

    const data =
      await DepartmentLastSemesterCourseModel.findOne({
        department: departmentId
      }).lean();

    return {
      status: "success",
      data: data?.courses || []
    };

  } catch (error) {
    console.error("GetDepartmentLastSemesterCoursesService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = GetDepartmentLastSemesterCoursesService;
