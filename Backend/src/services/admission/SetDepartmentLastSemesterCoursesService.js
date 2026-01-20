const DepartmentLastSemesterCourseModel =
  require("../../models/Admission/DepartmentLastSemesterCourseModel");

const SetDepartmentLastSemesterCoursesService = async (req) => {
  try {
    const chairman = req.user;
    const { courses } = req.body;

    // ================= AUTH =================
    if (!chairman || chairman.role !== "Chairman") {
      return { status: "fail", data: "Unauthorized access" };
    }

    if (!Array.isArray(courses) || courses.length === 0) {
      return {
        status: "fail",
        data: "At least one course is required"
      };
    }

    // ================= VALIDATE COURSES =================
    for (const c of courses) {
      if (!c.courseCode || !c.courseTitle || !c.creditHour) {
        return {
          status: "fail",
          data: "Course code, title and credit hour are required"
        };
      }
    }

    // ================= UPSERT =================
    const record =
      await DepartmentLastSemesterCourseModel.findOneAndUpdate(
        { department: chairman.department },
        {
          department: chairman.department,
          courses,
          createdBy: chairman._id,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );

    return {
      status: "success",
      data: record
    };

  } catch (error) {
    console.error("SetDepartmentLastSemesterCoursesService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = SetDepartmentLastSemesterCoursesService;
