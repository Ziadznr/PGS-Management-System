const UsersModel = require('../../models/Users/UsersModel');

const UserDetailsService = async (Request) => {
    try {
        const email = Request.user.email;

        const user = await UsersModel.findOne(
            { email },
            { password: 0 }
        ).lean();

        if (!user) {
            return { status: "fail", data: "User not found" };
        }

        // 🚫 Block temporary student access
        if (user.role === "Student" && user.isEnrolled === false) {
            return {
                status: "fail",
                data: "Enrollment not completed"
            };
        }

        return {
            status: "success",
            data: user
        };

    } catch (error) {
        return {
            status: "fail",
            data: error.toString()
        };
    }
};

module.exports = UserDetailsService;
