const DepartmentModel = require("../../models/Departments/DepartmentModel");
const UsersModel = require("../../models/Users/UsersModel");
const AdmissionApplicationModel =
    require("../../models/Admission/AdmissionApplicationModel");

const ApplyForAdmissionService = async (req) => {
    try {
        const {
            faculty,
            department,
            supervisor
        } = req.body;

        // 1️⃣ Validate department belongs to faculty
        const dept = await DepartmentModel.findOne({
            _id: department,
            FacultyID: faculty
        });

        if (!dept) {
            return { status: "fail", data: "Invalid department for selected faculty" };
        }

        // 2️⃣ Validate supervisor belongs to department
        const sup = await UsersModel.findOne({
            _id: supervisor,
            role: "Supervisor",
            department: department
        });

        if (!sup) {
            return { status: "fail", data: "Invalid supervisor for selected department" };
        }

        // 3️⃣ Save application
        const application = await AdmissionApplicationModel.create(req.body);

        return {
            status: "success",
            data: {
                applicationId: application._id,
                applicationStatus: application.applicationStatus
            }
        };

    } catch (error) {
        return { status: "fail", data: error.message };
    }
};

module.exports = ApplyForAdmissionService;
