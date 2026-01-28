const UsersModel = require("../../models/Users/UsersModel");
const DepartmentModel = require("../../models/Departments/DepartmentModel");
const UserTenureModel = require("../../models/Users/UserTenureModel");
const crypto = require("crypto");
const SendEmailUtility = require("../../utility/SendEmailUtility");

const AdminCreateUpdateUserService = async (req) => {
  try {
    /* ================= AUTH ================= */
    if (!req.user || req.user.role !== "admin") {
      return { status: "fail", data: "Unauthorized" };
    }

    const {
      name,
      nameExtension,
      email,
      phone,
      role,
      department,
      subject
    } = req.body;

    if (!name || !nameExtension || !email || !phone || !role) {
      return { status: "fail", data: "Missing required fields" };
    }

    const allowedRoles = ["Dean", "Chairman", "Supervisor"];
    if (!allowedRoles.includes(role)) {
      return { status: "fail", data: "Invalid role" };
    }

    /* =================================================
       🏛 DEAN / CHAIRMAN (TENURE AWARE)
    ================================================= */
    if (role === "Dean" || role === "Chairman") {
      /* ===== FIND CURRENT ACTIVE HOLDER ===== */
      const existingUser = await UsersModel.findOne({
        role,
        isActive: true
      });

      /* ===== EMAIL UNIQUE CHECK ===== */
      const emailConflict = await UsersModel.findOne({
  email: email.toLowerCase(),
  role,
  isActive: true,
  _id: { $ne: existingUser?._id }
});

if (emailConflict) {
  return {
    status: "fail",
    data: "Email already exists for this role"
  };
}

      /* ===== RESOLVE DEPARTMENT ===== */
      let deptId = null;

      if (role === "Chairman") {
        if (existingUser) {
          deptId = existingUser.department;
        } else {
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

      /* ===== CHECK IF THIS IS A REPLACEMENT ===== */
      const isReplacement =
        existingUser &&
        (
          existingUser.name !== name ||
          existingUser.email !== email.toLowerCase() ||
          existingUser.phone !== phone
        );

      const tempPassword = crypto.randomBytes(4).toString("hex");

      /* =================================================
         🔁 REPLACEMENT (NEW PERSON, SAME PANEL)
      ================================================= */
      if (existingUser && isReplacement) {
        // 1️⃣ End previous tenure
        await UserTenureModel.updateOne(
          { user: existingUser._id, endDate: null },
          { endDate: new Date() }
        );

        // 2️⃣ Deactivate previous user
        existingUser.isActive = false;
        await existingUser.save();

        // 3️⃣ Create new user
        const newUser = await UsersModel.create({
          name,
          nameExtension,
          email: email.toLowerCase(),
          phone,
          password: tempPassword,
          role,
          department: role === "Chairman" ? deptId : null,
          createdBy: req.user.id,
          isFirstLogin: true,
          isActive: true
        });

        // 4️⃣ Start new tenure
        await UserTenureModel.create({
          user: newUser._id,
          role,
          department: role === "Chairman" ? deptId : null,
          startDate: new Date(),
          appointedBy: req.user.id,
          remarks: "Replaced previous holder"
        });

        await SendEmailUtility(
          newUser.email,
          `
Hello ${newUser.name},

You have been appointed as ${newUser.role}.

Login Email : ${newUser.email}
Temporary Password : ${tempPassword}

Please change your password immediately.

Regards,
PGS Administration
          `,
          "PGS Appointment Notification"
        );

        return { status: "success" };
      }

      /* =================================================
         ✏️ NORMAL UPDATE (SAME PERSON)
      ================================================= */
      if (existingUser) {
        existingUser.name = name;
        existingUser.nameExtension = nameExtension;
        existingUser.phone = phone;
        existingUser.password = tempPassword;
        existingUser.isFirstLogin = true;

        // preserve model rules
        if (role === "Chairman") {
          existingUser.department = deptId;
        }
        if (role === "Dean") {
          existingUser.department = null;
        }

        await existingUser.save();

        await SendEmailUtility(
          existingUser.email,
          `
Hello ${existingUser.name},

Your ${existingUser.role} account has been UPDATED.

Login Email : ${existingUser.email}
Temporary Password : ${tempPassword}

⚠ Please change your password immediately.

Regards,
PGS Administration
          `,
          "PGS Role Updated"
        );

        return { status: "success" };
      }

      /* =================================================
         🆕 FIRST APPOINTMENT
      ================================================= */
      const user = await UsersModel.create({
        name,
        nameExtension,
        email: email.toLowerCase(),
        phone,
        password: tempPassword,
        role,
        department: role === "Chairman" ? deptId : null,
        createdBy: req.user.id,
        isFirstLogin: true,
        isActive: true
      });

      await UserTenureModel.create({
        user: user._id,
        role,
        department: role === "Chairman" ? deptId : null,
        startDate: new Date(),
        appointedBy: req.user.id
      });

      await SendEmailUtility(
        user.email,
        `
Hello ${user.name},

You have been appointed as ${user.role}.

Login Email : ${user.email}
Temporary Password : ${tempPassword}

Please change your password after login.

Regards,
PGS Administration
        `,
        "PGS Account Created"
      );

      return { status: "success" };
    }

    /* =================================================
       👨‍🏫 SUPERVISOR (CREATE ONLY)
    ================================================= */
    if (!department) {
      return { status: "fail", data: "Department required" };
    }

    const dept = await DepartmentModel.findById(department);
    if (!dept) {
      return { status: "fail", data: "Invalid department" };
    }

    const emailExists = await UsersModel.findOne({
  email: email.toLowerCase(),
  role: "Supervisor",
  department,
  isActive: true
});

    const activeSubjects = dept.offeredSubjects?.filter(s => s.isActive) || [];
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

    const tempPassword = crypto.randomBytes(4).toString("hex");

    const supervisor = await UsersModel.create({
      name,
      nameExtension,
      email: email.toLowerCase(),
      phone,
      password: tempPassword,
      role: "Supervisor",
      department,
      subject: finalSubject,
      createdBy: req.user.id,
      isFirstLogin: true,
      isActive: true
    });

    await SendEmailUtility(
      supervisor.email,
      `
Hello ${supervisor.name},

Your Supervisor account has been created.

Login Email : ${supervisor.email}
Temporary Password : ${tempPassword}

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

module.exports=AdminCreateUpdateUserService;
