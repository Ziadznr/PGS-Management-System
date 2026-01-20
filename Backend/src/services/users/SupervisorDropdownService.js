const UsersModel = require("../../models/Users/UsersModel");

const SupervisorDropdownService = async (req) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      return { status: "fail", data: "Department ID required" };
    }

    const supervisors = await UsersModel.find({
      role: "Supervisor",
      department: departmentId,
      isActive: true
    }).select("_id name email");

    return {
      status: "success",
      data: supervisors
    };

  } catch (error) {
    return { status: "fail", data: error.message };
  }
};

module.exports = SupervisorDropdownService;
