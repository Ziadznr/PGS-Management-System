const UsersModel = require("../../models/Users/UsersModel");

const SupervisorDropdownService = async (req) => {
  try {
    const { departmentId } = req.params;
    const { subject } = req.query;

    if (!departmentId) {
      return { status: "fail", data: "Department ID required" };
    }

    const query = {
      role: "Supervisor",
      department: departmentId,
      isActive: true
    };

    // 🔥 SUBJECT-AWARE FILTERING
    if (subject) {
      query.subject = subject;
    } else {
      // department-level supervisors (no subject)
      query.subject = null;
    }

    const supervisors = await UsersModel.find(query)
      .select("_id name subject")
      .lean();

    return {
      status: "success",
      data: supervisors
    };

  } catch (error) {
    console.error("SupervisorDropdownService error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = SupervisorDropdownService;
