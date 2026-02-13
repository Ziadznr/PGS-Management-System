const UsersModel = require('../../models/Users/UsersModel');

const UserDetailsService = async (Request) => {
    try {

        const email = Request.user.email;

        const user = await UsersModel.findOne(
            { email },
            { password: 0 }
        )
        .populate("department", "departmentName") // ⭐ ADD THIS
        .populate("hall", "name")       // ⭐ ADD THIS
        .lean();

        if (!user) {
            return {
                status: "fail",
                data: "User not found"
            };
        }

        /* 🚫 Block temporary student access */
        if (user.role === "Student" && user.isEnrolled === false) {
            return {
                status: "fail",
                data: "Enrollment not completed"
            };
        }

        /* ================= PHOTO URL FIX ================= */
        if (user.photo) {
            user.photo =
                `${Request.protocol}://${Request.get("host")}${user.photo}`;
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
