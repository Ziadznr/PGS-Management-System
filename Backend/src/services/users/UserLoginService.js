const bcrypt = require('bcryptjs');
const UsersModel = require('../../models/Users/UsersModel');
const CreateToken = require('../../utility/CreateUserToken');

const UserLoginService = async (Request) => {
    try {
        const { email, password } = Request.body;

        // 1️⃣ Find user
        const user = await UsersModel.findOne({ email });

        if (!user) {
            return { status: 'unauthorized', data: 'Invalid email or password' };
        }

        // 2️⃣ Block student if enrollment not completed
        if (user.role === "Student" && user.isEnrolled === false) {
            return {
                status: 'unauthorized',
                data: 'Enrollment not completed yet'
            };
        }

        // 3️⃣ Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return { status: 'unauthorized', data: 'Invalid email or password' };
        }

        // 4️⃣ Create JWT token
        const token = await CreateToken({
            email: user.email,
            role: user.role
        });

        // 5️⃣ Remove password
        const userData = user.toObject();
        delete userData.password;

        return {
            status: 'success',
            token,
            data: userData
        };

    } catch (error) {
        return { status: 'fail', data: error.toString() };
    }
};

module.exports = UserLoginService;
