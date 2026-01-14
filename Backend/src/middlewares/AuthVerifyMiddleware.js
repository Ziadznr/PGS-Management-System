const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Admin token missing"
      });
    }

    jwt.verify(token, "SecretKey123456789", (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: "fail",
          message: "Invalid or expired admin token"
        });
      }

      // ✅ STANDARDIZED USER OBJECT
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      next();
    });

  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Admin authentication failed"
    });
  }
};
