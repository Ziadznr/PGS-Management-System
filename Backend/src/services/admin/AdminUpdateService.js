const AdminUpdateService = async (Request, DataModel) => {
  try {
    const adminId = Request.user.id;

    const updateData = {};

    if (Request.body.firstName) updateData.firstName = Request.body.firstName;
    if (Request.body.lastName) updateData.lastName = Request.body.lastName;
    if (Request.body.mobile) updateData.mobile = Request.body.mobile;
    if (Request.body.photo) updateData.photo = Request.body.photo;

    // 🔒 password optional
    if (Request.body.password) {
      updateData.password = Request.body.password;
    }

    await DataModel.updateOne(
      { _id: adminId },
      { $set: updateData }   // ✅ VERY IMPORTANT
    );

    return { status: "success" };

  } catch (error) {
    return { status: "fail", data: error.toString() };
  }
};

module.exports = AdminUpdateService;
