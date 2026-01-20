const bcrypt = require("bcryptjs");
const UsersModel = require("../../models/Users/UsersModel");
const CreateToken = require("../../utility/CreateUserToken");

const UserLoginService = async (req) => {
  try {
    const { email, password } = req.body;

    // ================= VALIDATION =================
    if (!email || !password) {
      return {
        status: "fail",
        data: "Email and password are required"
      };
    }

    // ================= FIND USER =================
    const user = await UsersModel.findOne({
      email: email.toLowerCase()
    }).select("+password");

    if (!user) {
      return {
        status: "unauthorized",
        data: "Invalid email or password"
      };
    }

    // ================= ACTIVE CHECK =================
    if (!user.isActive) {
      return {
        status: "unauthorized",
        data: "Your account is no longer active"
      };
    }

    // ================= PASSWORD CHECK =================
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        status: "unauthorized",
        data: "Invalid email or password"
      };
    }

    // ================= TOKEN =================
    const token = await CreateToken({
      id: user._id,
      email: user.email,
      role: user.role,
      department: user.department
    });

    const userData = user.toObject();
    delete userData.password;

    return {
      status: "success",
      token,
      data: userData
    };

  } catch (error) {
    console.error("UserLoginService Error:", error);
    return {
      status: "fail",
      data: "Login failed"
    };
  }
};

module.exports = UserLoginService;
