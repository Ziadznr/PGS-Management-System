const bcrypt = require('bcrypt');
const CreateToken = require('../../utility/CreateToken');

const UserLoginService = async (Request, DataModel) => {
    try {

        const { email, password } = Request.body;

        // 1. Find user by email
        const user = await DataModel.findOne({ email: email });

        if (!user) {
            return { status: "unauthorized", message: "Email not found" };
        }

        // 2. Compare hashed password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return { status: "unauthorized", message: "Wrong password" };
        }

        // 3. Create JWT token including category (role)
        const token = await CreateToken({
            email: user.email,
            category: user.category    // include user role
        });

        // 4. Remove password before sending response
        const safeUser = user.toObject();
        delete safeUser.password;

        return {
            status: "success",
            token: token,
            data: safeUser
        };

    } catch (error) {
        return { status: "fail", data: error.toString() };
    }
}

module.exports = UserLoginService;
