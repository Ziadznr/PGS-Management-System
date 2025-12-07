const bcrypt = require('bcrypt');

const UserUpdateService = async (Request, DataModel) => {
    try {
        const email = Request.user.email; // from middleware
        let updateData = { ...Request.body };

        // 1. Prevent user from updating role/category
        if (updateData.category) {
            delete updateData.category; 
        }

        // 2. Hash new password if provided
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        // 3. Prevent changing system fields
        delete updateData._id;
        delete updateData.createdDate;

        // 4. Update user data
        const result = await DataModel.updateOne(
            { email: email },
            updateData
        );

        return { status: 'success', data: result };

    } catch (error) {
        return { status: 'fail', data: error.toString() };
    }
};

module.exports = UserUpdateService;
