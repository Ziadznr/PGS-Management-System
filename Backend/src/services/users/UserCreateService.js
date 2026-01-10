const UsersModel = require('../../models/Users/UsersModel');
const DepartmentModel = require('../../models/Departments/DepartmentModel');

const UserCreateService = async (Request) => {
    try {
        const postBody = Request.body;

        // Normalize role
        if (postBody.role) {
            postBody.role = postBody.role.trim();
        }

        // 1️⃣ Allowed roles (NO Student here)
        const allowedRoles = ["Dean", "Chairman", "Supervisor"];
        if (!allowedRoles.includes(postBody.role)) {
            return { status: 'fail', data: 'Invalid or restricted role' };
        }

        // 2️⃣ Prevent duplicate email
        const emailExists = await UsersModel.findOne({ email: postBody.email });
        if (emailExists) {
            return { status: 'fail', data: 'Email already exists' };
        }

        // 3️⃣ SINGLE Dean rule (PGS only)
        if (postBody.role === "Dean") {
            const deanExists = await UsersModel.findOne({ role: "Dean" });
            if (deanExists) {
                return { status: 'fail', data: 'Dean already exists' };
            }
            postBody.department = null;
        }

        // 4️⃣ Department validation (Chairman & Supervisor)
        if (postBody.role === "Chairman" || postBody.role === "Supervisor") {
            if (!postBody.department) {
                return { status: 'fail', data: 'Department is required' };
            }

            const department = await DepartmentModel.findById(postBody.department);
            if (!department) {
                return { status: 'fail', data: 'Invalid department' };
            }

            // 5️⃣ SINGLE Chairman per department
            if (postBody.role === "Chairman") {
                const chairmanExists = await UsersModel.findOne({
                    role: "Chairman",
                    department: postBody.department
                });

                if (chairmanExists) {
                    return {
                        status: 'fail',
                        data: 'Chairman already exists for this department'
                    };
                }
            }
        }

        // 6️⃣ Create user (password hashing handled by schema)
        const data = await UsersModel.create(postBody);

        // 7️⃣ Remove password from response
        const safeData = data.toObject();
        delete safeData.password;

        return { status: 'success', data: safeData };

    } catch (error) {
        return { status: 'fail', data: error.toString() };
    }
};

module.exports = UserCreateService;
