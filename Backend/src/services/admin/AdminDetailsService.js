const mongoose = require("mongoose");

const AdminDetailsService = async (Request, DataModel) => {
  try {
    const adminId = Request.user?.id; // ✅ FROM JWT

    if (!adminId) {
      return { status: "fail", data: "Unauthorized admin" };
    }

    const data = await DataModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(adminId)
        }
      },
      {
        $project: {
          password: 0 // 🔒 hide password
        }
      }
    ]);

    return { status: "success", data };

  } catch (error) {
    return { status: "fail", data: error.message };
  }
};

module.exports = AdminDetailsService;
