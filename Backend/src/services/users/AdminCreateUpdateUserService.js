const UsersModel = require("../../models/Users/UsersModel");
const DepartmentModel = require("../../models/Departments/DepartmentModel");
const crypto = require("crypto");
const SendEmailUtility = require("../../utility/SendEmailUtility");

const AdminCreateUpdateUserService = async (req) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return { status: "fail", data: "Unauthorized" };
    }

    const { name, nameExtension, email, phone, role, department, subject } = req.body;

    if (!name || !email || !role) {
      return { status: "fail", data: "Missing required fields" };
    }

    const allowedRoles = ["Dean", "Chairman", "Supervisor"];
    if (!allowedRoles.includes(role)) {
      return { status: "fail", data: "Invalid role" };
    }

    /* =================================================
       🔁 DEAN / CHAIRMAN → UPDATE OR CREATE
    ================================================= */
    if (role === "Dean" || role === "Chairman") {
      const filter =
        role === "Dean"
          ? { role: "Dean", isActive: true }
          : { role: "Chairman", isActive: true };

      const existingUser = await UsersModel.findOne(filter);

      /* ===== EMAIL UNIQUE CHECK ===== */
      const emailExists = await UsersModel.findOne({
        email: email.toLowerCase(),
        _id: { $ne: existingUser?._id }
      });

      if (emailExists) {
        return { status: "fail", data: "Email already exists" };
      }

      /* ===== RESOLVE DEPARTMENT ===== */
      let deptId = null;

      if (role === "Chairman") {
        // ✅ UPDATE → keep existing department
        if (existingUser) {
          deptId = existingUser.department;
        } 
        // ✅ CREATE → department required
        else {
          if (!department) {
            return { status: "fail", data: "Department required" };
          }

          const dept = await DepartmentModel.findById(department);
          if (!dept) {
            return { status: "fail", data: "Invalid department" };
          }

          deptId = department;
        }
      }

      const tempPassword = crypto.randomBytes(4).toString("hex");

      /* ===== UPDATE EXISTING ===== */
      if (existingUser) {
        existingUser.name = name;
        existingUser.nameExtension = nameExtension;
        existingUser.email = email.toLowerCase();
        existingUser.phone = phone || existingUser.phone;
        existingUser.password = tempPassword;
        existingUser.isFirstLogin = true;
        existingUser.updatedAt = new Date();

        await existingUser.save();

        await SendEmailUtility(
          existingUser.email,
          `
Hello ${existingUser.name},

You have been appointed as ${existingUser.role}.

Login Email: ${existingUser.email}
Temporary Password: ${tempPassword}

⚠ Please change your password immediately after login.

Regards,
PGS Administration
          `,
          "PGS Role Updated"
        );

        return { status: "success" };
      }

      /* ===== CREATE NEW ===== */
      const user = await UsersModel.create({
        name,
        nameExtension,
        email: email.toLowerCase(),
        phone,
        password: tempPassword,
        role,
        department: deptId,
        createdBy: req.user.id,
        isFirstLogin: true,
        tenure: { startDate: new Date() }
      });

      await SendEmailUtility(
        user.email,
        `
Hello ${user.name},

You have been appointed as ${user.role}.

Login Email: ${user.email}
Temporary Password: ${tempPassword}

Please change your password after login.

Regards,
PGS Administration
        `,
        "PGS Account Created"
      );

      return { status: "success" };
    }

    /* =================================================
       👨‍🏫 SUPERVISOR → ALWAYS CREATE
    ================================================= */
    if (!department) {
      return { status: "fail", data: "Department required" };
    }

    const dept = await DepartmentModel.findById(department);
    if (!dept) {
      return { status: "fail", data: "Invalid department" };
    }

    const activeSubjects = dept.offeredSubjects.filter(s => s.isActive);

    let finalSubject = null;
    if (activeSubjects.length > 0) {
      if (!subject) {
        return { status: "fail", data: "Subject required" };
      }

      if (!activeSubjects.some(s => s.name === subject)) {
        return { status: "fail", data: "Invalid subject" };
      }

      finalSubject = subject;
    }

    const exists = await UsersModel.findOne({ email: email.toLowerCase() });
    if (exists) {
      return { status: "fail", data: "Email already exists" };
    }

    const tempPassword = crypto.randomBytes(4).toString("hex");

    const supervisor = await UsersModel.create({
      name,
      nameExtension,
      email: email.toLowerCase(),
      phone,
      password: tempPassword,
      role,
      department,
      subject: finalSubject,
      createdBy: req.user.id,
      isFirstLogin: true,
      tenure: { startDate: new Date() }
    });

    await SendEmailUtility(
      supervisor.email,
      `
Hello ${supervisor.name},

Your supervisor account has been created.

Temporary Password: ${tempPassword}

Please change your password after login.

Regards,
PGS Administration
      `,
      "PGS Supervisor Account Created"
    );

    return { status: "success" };

  } catch (error) {
    console.error("AdminCreateUpdateUserService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = AdminCreateUpdateUserService;
