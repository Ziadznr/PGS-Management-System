const bcrypt = require('bcryptjs');
const UsersModel = require('../../models/Users/UsersModel');

const UserUpdateService = async (Request) => {
    try {
        // Email from UserAuthMiddleware (JWT)
        const email = Request.user.email;
        const updateData = { ...Request.body };

        // ❌ Prevent role & department change by user
        delete updateData.role;
        delete updateData.department;

        // ❌ Prevent system field updates
        delete updateData._id;
        delete updateData.createdAt;

        // 🔐 Hash password if user wants to change it
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const result = await UsersModel.updateOne(
            { email: email },
            updateData
        );

        return { status: 'success', data: result };

    } catch (error) {
        return { status: 'fail', data: error.toString() };
    }
};

module.exports = UserUpdateService;
