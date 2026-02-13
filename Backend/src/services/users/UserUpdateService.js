const bcrypt = require("bcryptjs");
const UsersModel = require("../../models/Users/UsersModel");

const UserUpdateService = async (req) => {
  try {

    const email = req.user.email;
    const updateData = { ...req.body };

    /* ================= PHOTO UPLOAD ================= */
    if (req.file) {
      updateData.photo =
        "/uploads/user-photos/" + req.file.filename;
    }

    /* ================= BLOCK FORBIDDEN FIELDS ================= */
    delete updateData.role;
    delete updateData.department;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.createdBy;
    delete updateData.isActive;
    delete updateData.tenure;

    /* ================= PASSWORD CHANGE ================= */
    if (updateData.password) {

      if (updateData.password.length < 6) {
        return {
          status: "fail",
          data: "Password must be at least 6 characters"
        };
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password =
        await bcrypt.hash(updateData.password, salt);

      // 🔥 force first login false
      updateData.isFirstLogin = false;
    }

    await UsersModel.updateOne(
      { email },
      { $set: updateData }
    );

    return {
      status: "success",
      data: "Profile updated successfully"
    };

  } catch (error) {

    console.error("UserUpdateService Error:", error);

    return {
      status: "fail",
      data: error.toString()
    };
  }
};

module.exports = UserUpdateService;
