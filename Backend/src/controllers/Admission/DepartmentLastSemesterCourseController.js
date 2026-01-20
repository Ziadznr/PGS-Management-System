const SetService =
  require("../../services/admission/SetDepartmentLastSemesterCoursesService");

const DepartmentCourseListService =
  require("../../services/admission/DepartmentCourseListService");

const GetPublicService =
  require("../../services/admission/GetDepartmentLastSemesterCoursesService");

// ================= CHAIRMAN =================

// Create / Update
exports.SetDepartmentLastSemesterCourses = async (req, res) => {
  const result = await SetService(req);
  return res.status(200).json(result);
};

// List (Chairman’s own department)
exports.DepartmentCourseList = async (req, res) => {
  const result = await DepartmentCourseListService(req);
  return res.status(200).json(result);
};

// ================= PUBLIC (STUDENT) =================
exports.GetDepartmentLastSemesterCourses = async (req, res) => {
  const result = await GetPublicService(req);
  return res.status(200).json(result);
};
