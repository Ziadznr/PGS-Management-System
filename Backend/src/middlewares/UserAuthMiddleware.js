const jwt = require("jsonwebtoken");
const UsersModel = require("../models/Users/UsersModel");

const JWT_SECRET = "UserSecretKey123456789"; // 🔥 SAME AS LOGIN

module.exports = async (req, res, next) => {
  try {
    // ✅ Accept token from frontend
    const token =
      req.headers.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: "unauthorized",
        message: "User token missing"
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 🔥 Your token payload format
    // {
    //   data: { id, email, role, department }
    // }
    const userId = decoded?.data?.id;

    if (!userId) {
      return res.status(401).json({
        status: "unauthorized",
        message: "Invalid token payload"
      });
    }

    // 🔥 RECHECK USER STATUS
    const user = await UsersModel.findById(userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        status: "unauthorized",
        message: "Account is inactive"
      });
    }

    // ✅ Attach user to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      department: user.department
    };

    next();

  } catch (error) {
    console.error("UserAuthMiddleware Error:", error);

    return res.status(401).json({
      status: "unauthorized",
      message: "Invalid or expired token"
    });
  }
};
