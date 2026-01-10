const DepartmentModel = require("../../models/Departments/DepartmentModel");

const DepartmentByFacultyService = async (facultyId) => {
    try {
        const data = await DepartmentModel.find(
            { FacultyID: facultyId },
            { _id: 1, Name: 1 }
        ).lean();

        return { status: "success", data };
    } catch (error) {
        return { status: "fail", data: error.message };
    }
};

module.exports = DepartmentByFacultyService;
