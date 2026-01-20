const UsersModel = require("../../models/Users/UsersModel");

const StudentRegisterService = async (req) => {
  try {
    const { name, email, phone, password, department } = req.body;

    if (!name || !email || !phone || !password || !department) {
      return { status: "fail", data: "All fields required" };
    }

    const exists = await UsersModel.findOne({ email });
    if (exists) {
      return { status: "fail", data: "Email already exists" };
    }

    const student = await UsersModel.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: "Student",
      department,
      isSelfRegistered: true,
      createdBy: null
    });

    return { status: "success", data: "Registration successful" };

  } catch (e) {
    return { status: "fail", data: e.message };
  }
};

module.exports = StudentRegisterService;
