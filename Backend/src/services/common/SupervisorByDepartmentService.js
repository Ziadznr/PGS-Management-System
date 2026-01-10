const UsersModel = require("../../models/Users/UsersModel");

const SupervisorByDepartmentService = async (departmentId) => {
    try {
        const data = await UsersModel.find(
            {
                role: "Supervisor",
                department: departmentId
            },
            { _id: 1, name: 1, email: 1 }
        ).lean();

        return { status: "success", data };
    } catch (error) {
        return { status: "fail", data: error.message };
    }
};

module.exports = SupervisorByDepartmentService;
