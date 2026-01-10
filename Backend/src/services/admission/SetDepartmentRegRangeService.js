const DepartmentRegistrationRangeModel =
  require("../../models/Admission/DepartmentRegistrationRangeModel");

const SetDepartmentRegRangeService = async (req) => {
  try {
    const {
      admissionSeason,
      department,
      startRegNo,
      endRegNo
    } = req.body;

    // ✅ Validation
    if (!admissionSeason || !department || !startRegNo || !endRegNo) {
      return { status: "fail", data: "All fields are required" };
    }

    if (Number(startRegNo) >= Number(endRegNo)) {
      return {
        status: "fail",
        data: "Start registration number must be less than end number"
      };
    }

    const range = await DepartmentRegistrationRangeModel.create({
      admissionSeason,
      department,
      startRegNo,
      endRegNo,
      currentRegNo: startRegNo
    });

    return { status: "success", data: range };

  } catch (error) {

    // 🔒 Duplicate protection (one range per department per season)
    if (error.code === 11000) {
      return {
        status: "fail",
        data: "Registration range already exists for this department and session"
      };
    }

    return { status: "fail", data: error.message };
  }
};

module.exports = SetDepartmentRegRangeService;
