const jwt = require("jsonwebtoken");

const CreateToken = async (admin) => {
  const payload = {
    id: admin._id,          // ✅ REQUIRED
    email: admin.email,     // ✅ REQUIRED
    role: "admin",          // ✅ REQUIRED (or admin.role)
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  };

  return jwt.sign(payload, "SecretKey123456789");
};

module.exports = CreateToken;
