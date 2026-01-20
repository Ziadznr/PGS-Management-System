const UsersModel = require("../../models/Users/UsersModel");
const DepartmentModel = require("../../models/Departments/DepartmentModel");
const crypto = require("crypto");
const SendEmailUtility = require("../../utility/SendEmailUtility");

const AdminCreateUserService = async (req) => {
  try {
    // ================= AUTH =================
    if (!req.user || req.user.role !== "admin") {
      return { status: "fail", data: "Unauthorized" };
    }

    const { name, email, phone, role, department } = req.body;

    if (!name || !email || !phone || !role) {
      return { status: "fail", data: "Missing required fields" };
    }

    const allowedRoles = ["Dean", "Chairman", "Supervisor"];
    if (!allowedRoles.includes(role)) {
      return { status: "fail", data: "Invalid role" };
    }

    // ================= EMAIL UNIQUE =================
    const exists = await UsersModel.findOne({ email: email.toLowerCase() });
    if (exists) {
      return { status: "fail", data: "Email already exists" };
    }

    // ================= CONTROLLED REPLACEMENT =================
    let deptId = null;

    if (role !== "Dean") {
      if (!department) {
        return { status: "fail", data: "Department required" };
      }

      const dept = await DepartmentModel.findById(department);
      if (!dept) {
        return { status: "fail", data: "Invalid department" };
      }

      deptId = department;
    }

    // 🔁 Replace Dean
    if (role === "Dean") {
      const activeDean = await UsersModel.findOne({
        role: "Dean",
        isActive: true
      });

      if (activeDean) {
        await UsersModel.findByIdAndUpdate(activeDean._id, {
          isActive: false,
          deactivatedAt: new Date(),
          "tenure.endDate": new Date()
        });
      }
    }

    // 🔁 Replace Chairman
    if (role === "Chairman") {
      const activeChairman = await UsersModel.findOne({
        role: "Chairman",
        department: deptId,
        isActive: true
      });

      if (activeChairman) {
        await UsersModel.findByIdAndUpdate(activeChairman._id, {
          isActive: false,
          deactivatedAt: new Date(),
          "tenure.endDate": new Date()
        });
      }
    }

    // ================= TEMP PASSWORD =================
    const tempPassword = crypto.randomBytes(4).toString("hex");

    const user = await UsersModel.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: tempPassword,
      role,
      department: deptId,
      isSelfRegistered: false,
      isFirstLogin: true,
      createdBy: req.user.id,
      tenure: {
        startDate: new Date(),
        endDate: null
      }
    });

    // ================= SEND EMAIL =================
    await SendEmailUtility(
      user.email,
      `
Hello ${user.name},

Your PGS account has been created.

Role: ${user.role}
Temporary Password: ${tempPassword}

Please login and change your password immediately.

Regards,
PGS Administration
      `,
      "PGS Account Created"
    );

    return {
      status: "success",
      data: "User created successfully & credentials sent by email"
    };

  } catch (error) {
    console.error("AdminCreateUserService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = AdminCreateUserService;
