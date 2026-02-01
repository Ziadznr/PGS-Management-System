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
      id,
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

    /* ================= EXISTING USER (BY ID) ================= */
    const existingUserById = id ? await UsersModel.findById(id) : null;

    /* =================================================
       ✉️ EMAIL ONLY UPDATE (ALL ROLES)
       - allowed even for Dean / Chairman
    ================================================= */
    if (existingUserById) {
      const isEmailOnlyUpdate =
        existingUserById.email !== email.toLowerCase() &&
        existingUserById.name === name &&
        existingUserById.phone === phone;

      if (isEmailOnlyUpdate) {
        existingUserById.email = email.toLowerCase();
        await existingUserById.save();

        await SendEmailUtility(
          existingUserById.email,
          `
Hello ${existingUserById.name},

Your login email has been updated successfully.

New Login Email: ${existingUserById.email}
Password remains unchanged.

Regards,
PGS Administration
          `,
          "PGS Login Email Updated"
        );

        return { status: "success" };
      }
    }

  /* =================================================
   🏛 DEAN / CHAIRMAN (WITH TENURE)
================================================= */
if (role === "Dean" || role === "Chairman") {

  let existingUser = null;

  /* ================= FIND EXISTING ================= */
  if (role === "Dean") {
    existingUser = await UsersModel.findOne({
      role: "Dean",
      isActive: true
    });
  }
if (role === "Chairman") {
  if (id) {
    // 🔐 EDIT / REPLACE → use existing user's department
    existingUser = await UsersModel.findById(id);
  } else {
    // 🆕 CREATE → department must be provided
    if (!department) {
      return { status: "fail", data: "Department required" };
    }

    existingUser = await UsersModel.findOne({
      role: "Chairman",
      department,
      isActive: true
    });
  }
}


  /* ================= EMAIL UNIQUE CHECK ================= */
 const emailQuery = {
  email: email.toLowerCase(),
  role,
  isActive: true,
  _id: { $ne: existingUser?._id }
};

if (role === "Chairman") {
  emailQuery.department = department;
}

const emailConflict = await UsersModel.findOne(emailQuery);


  if (emailConflict) {
    return { status: "fail", data: "Email already exists for this role" };
  }

  const tempPassword = crypto.randomBytes(4).toString("hex");

  /* =================================================
     🔁 UPDATE / REPLACE EXISTING
  ================================================= */
  if (existingUser) {

    const isPersonChanged =
      existingUser.name !== name ||
      existingUser.phone !== phone;

    /* ================= TENURE (DEAN + CHAIRMAN) ================= */
    if (isPersonChanged) {
      // close active tenure
      await UserTenureModel.updateMany(
        { user: existingUser._id, endDate: null },
        { endDate: new Date() }
      );

      // open new tenure
   await UserTenureModel.create({
  user: existingUser._id,
  role,
  department: role === "Chairman" ? existingUser.department : null,
  nameSnapshot: name,
  emailSnapshot: existingUser.email,
  startDate: new Date(),
  appointedBy: req.user.id,
  remarks: `${role} replaced`
});

    }

   /* ================= UPDATE USER ================= */
existingUser.name = name;
existingUser.nameExtension = nameExtension;
existingUser.phone = phone;

if (!isPersonChanged) {
  existingUser.email = email.toLowerCase();
}

existingUser.password = tempPassword;
existingUser.isFirstLogin = true;

// 🚫 DO NOT TOUCH department here

await existingUser.save();

    await SendEmailUtility(
      existingUser.email,
      `
Hello ${existingUser.name},

You have been assigned as ${existingUser.role}.

Login Email: ${existingUser.email}
Temporary Password: ${tempPassword}

Please change your password after login.

Regards,
PGS Administration
      `,
      "PGS Panel Member Updated"
    );

    return { status: "success" };
  }

  /* =================================================
     🆕 FIRST APPOINTMENT
  ================================================= */
  const newUser = await UsersModel.create({
    name,
    nameExtension,
    email: email.toLowerCase(),
    phone,
    password: tempPassword,
    role,
    department: role === "Chairman" ? department : null,
    createdBy: req.user.id,
    isFirstLogin: true,
    isActive: true
  });

  /* ================= TENURE (FIRST) ================= */
await UserTenureModel.create({
  user: newUser._id,
  role,
  department: role === "Chairman" ? department : null,
  nameSnapshot: newUser.name,
  emailSnapshot: newUser.email,
  startDate: new Date(),
  appointedBy: req.user.id,
  remarks: "First appointment"
});


  await SendEmailUtility(
    newUser.email,
    `
Hello ${newUser.name},

You have been appointed as ${newUser.role}.

Login Email: ${newUser.email}
Temporary Password: ${tempPassword}

Please change your password after login.

Regards,
PGS Administration
    `,
    "PGS Panel Member Appointed"
  );

  return { status: "success" };
}


    /* =================================================
       👨‍🏫 SUPERVISOR (CREATE ONLY)
    ================================================= */
    if (!existingUserById && !department) {
      return { status: "fail", data: "Department required" };
    }

    const dept = await DepartmentModel.findById(department);
    if (!dept) {
      return { status: "fail", data: "Invalid department" };
    }

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

Login Email: ${supervisor.email}
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
