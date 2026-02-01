const bcrypt = require("bcryptjs");
const UsersModel = require("../../models/Users/UsersModel");

const UserResetPassService = async (req) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return { status: "fail", data: "Missing required fields" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await UsersModel.updateOne(
      { email: email.toLowerCase() },
      {
        password: hashedPassword,
        isFirstLogin: false
      }
    );

    if (result.modifiedCount === 0) {
      return { status: "fail", data: "Password update failed" };
    }

    return { status: "success", data: "Password updated successfully" };

  } catch (error) {
    return { status: "fail", data: error.toString() };
  }
};

module.exports = UserResetPassService;
