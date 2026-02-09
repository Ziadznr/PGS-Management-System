const UsersModel = require("../../models/Users/UsersModel");
const DepartmentModel = require("../../models/Departments/DepartmentModel");
const UserTenureModel = require("../../models/Users/UserTenureModel");
const crypto = require("crypto");
const SendEmailUtility = require("../../utility/SendEmailUtility");

/* ======================================================
   CONFIG
====================================================== */

const SINGLE_INSTANCE_ROLES = [
  "Dean",
  "VC",
  "Registrar",
  "PGS Specialist"
];

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
      hall,
      subject
    } = req.body;

    if (!name || !nameExtension || !email || !phone || !role) {
      return { status: "fail", data: "Missing required fields" };
    }

    /* ================= ROLE VALIDATION ================= */
    const allowedRoles = [
      ...SINGLE_INSTANCE_ROLES,
      "Chairman",
      "Provost",
      "Supervisor"
    ];

    if (!allowedRoles.includes(role)) {
      return { status: "fail", data: "Invalid role" };
    }

    const existingUserById = id ? await UsersModel.findById(id) : null;

    /* =================================================
       ✉️ EMAIL ONLY UPDATE
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

Regards,
PGS Administration
          `,
          "PGS Login Email Updated"
        );

        return { status: "success" };
      }
    }

    /* =================================================
       🏛 SINGLE INSTANCE ROLES
    ================================================= */
    if (SINGLE_INSTANCE_ROLES.includes(role)) {
      let existingUser = await UsersModel.findOne({
        role,
        isActive: true
      });

      const tempPassword = crypto.randomBytes(4).toString("hex");

      if (existingUser) {
        const isPersonChanged =
          existingUser.name !== name ||
          existingUser.phone !== phone;

        if (isPersonChanged) {
          await UserTenureModel.updateMany(
            { user: existingUser._id, endDate: null },
            { endDate: new Date() }
          );

          await UserTenureModel.create({
            user: existingUser._id,
            role,
            nameSnapshot: name,
            emailSnapshot: existingUser.email,
            startDate: new Date(),
            appointedBy: req.user.id,
            remarks: `${role} replaced`
          });
        }

        existingUser.name = name;
        existingUser.nameExtension = nameExtension;
        existingUser.phone = phone;

        if (!isPersonChanged) {
          existingUser.email = email.toLowerCase();
        }

        existingUser.password = tempPassword;
        existingUser.isFirstLogin = true;
        await existingUser.save();

        await SendEmailUtility(
          existingUser.email,
          `
Hello ${existingUser.name},

You have been assigned as ${existingUser.role}.

Login Email: ${existingUser.email}
Temporary Password: ${tempPassword}

Regards,
PGS Administration
          `,
          `PGS ${role} Updated`
        );

        return { status: "success" };
      }

      const newUser = await UsersModel.create({
        name,
        nameExtension,
        email: email.toLowerCase(),
        phone,
        password: tempPassword,
        role,
        createdBy: req.user.id,
        isFirstLogin: true,
        isActive: true
      });

      await UserTenureModel.create({
        user: newUser._id,
        role,
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

Regards,
PGS Administration
        `,
        `PGS ${role} Appointed`
      );

      return { status: "success" };
    }

    /* =================================================
       🏫 CHAIRMAN (PER DEPARTMENT)
    ================================================= */
  /* =================================================
   🏫 CHAIRMAN (ONE PER DEPARTMENT)
================================================= */
if (role === "Chairman") {

  // 🔒 Department required on create
  if (!department && !id) {
    return { status: "fail", data: "Department required" };
  }

  // 🔍 Find existing chairman
  const existingUser = id
    ? await UsersModel.findById(id)
    : await UsersModel.findOne({
        role: "Chairman",
        department,
        isActive: true
      });

  const tempPassword = crypto.randomBytes(4).toString("hex");

  /* =================================================
     🔁 REPLACE / UPDATE EXISTING CHAIRMAN
  ================================================= */
  if (existingUser) {

    const isPersonChanged =
      existingUser.name !== name ||
      existingUser.phone !== phone;

    // 📜 TENURE CLOSE + OPEN (only if person changed)
    if (isPersonChanged) {
      await UserTenureModel.updateMany(
        { user: existingUser._id, endDate: null },
        { endDate: new Date() }
      );

      await UserTenureModel.create({
        user: existingUser._id,
        role: "Chairman",
        department: existingUser.department,
        nameSnapshot: name,
        emailSnapshot: existingUser.email,
        startDate: new Date(),
        appointedBy: req.user.id,
        remarks: "Chairman replaced"
      });
    }

    // 🔄 UPDATE USER
    existingUser.name = name;
    existingUser.nameExtension = nameExtension;
    existingUser.phone = phone;

    // 📧 Email only editable if person NOT changed
    if (!isPersonChanged) {
      existingUser.email = email.toLowerCase();
    }

    existingUser.password = tempPassword;
    existingUser.isFirstLogin = true;

    await existingUser.save();

    // ✉️ EMAIL
    await SendEmailUtility(
      existingUser.email,
      `
Hello ${existingUser.name},

You have been assigned as Chairman.

Login Email: ${existingUser.email}
Temporary Password: ${tempPassword}

Please change your password after login.

Regards,
PGS Administration
      `,
      "PGS Chairman Updated"
    );

    return { status: "success" };
  }

  /* =================================================
     🆕 FIRST APPOINTMENT (NO CHAIRMAN YET)
  ================================================= */
  const newUser = await UsersModel.create({
    name,
    nameExtension,
    email: email.toLowerCase(),
    phone,
    password: tempPassword,
    role: "Chairman",
    department,
    createdBy: req.user.id,
    isFirstLogin: true,
    isActive: true
  });

  await UserTenureModel.create({
    user: newUser._id,
    role: "Chairman",
    department,
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

You have been appointed as Chairman.

Login Email: ${newUser.email}
Temporary Password: ${tempPassword}

Please change your password after login.

Regards,
PGS Administration
    `,
    "PGS Chairman Appointed"
  );

  return { status: "success" };
}


    /* =================================================
       🏠 PROVOST (PER HALL)
    ================================================= */
if (role === "Provost") {

  // 🔒 Hall required ONLY on create
  if (!id && !hall) {
    return { status: "fail", data: "Hall required" };
  }

  // 🔍 Load existing provost
  const existingUser = id
    ? await UsersModel.findById(id)
    : await UsersModel.findOne({
        role: "Provost",
        hall,
        isActive: true
      });

  if (!existingUser) {
    return { status: "fail", data: "Provost not found" };
  }

  const tempPassword = crypto.randomBytes(4).toString("hex");

  const isPersonChanged =
    existingUser.name !== name ||
    existingUser.phone !== phone;

  /* ================= TENURE ================= */
  if (isPersonChanged) {
    await UserTenureModel.updateMany(
      { user: existingUser._id, endDate: null },
      { endDate: new Date() }
    );

    await UserTenureModel.create({
      user: existingUser._id,
      role: "Provost",
      hall: existingUser.hall, // 🔒 KEEP OLD HALL
      nameSnapshot: name,
      emailSnapshot: existingUser.email,
      startDate: new Date(),
      appointedBy: req.user.id,
      remarks: "Provost replaced"
    });
  }

  /* ================= UPDATE USER ================= */
  existingUser.name = name;
  existingUser.nameExtension = nameExtension;
  existingUser.phone = phone;

  // 📧 Email editable ONLY if person not changed
  if (!isPersonChanged) {
    existingUser.email = email.toLowerCase();
  }

  // 🔒 NEVER CHANGE HALL ON REPLACE
  // existingUser.hall = existingUser.hall;

  existingUser.password = tempPassword;
  existingUser.isFirstLogin = true;

  await existingUser.save();

  await SendEmailUtility(
    existingUser.email,
    `
Hello ${existingUser.name},

You have been assigned as Provost.

Login Email: ${existingUser.email}
Temporary Password: ${tempPassword}

Please change your password after login.

Regards,
PGS Administration
    `,
    "PGS Provost Updated"
  );

  return { status: "success" };
}



/* =================================================
       👨‍🏫 SUPERVISOR (CREATE ONLY)
    ================================================= */
   if (role === "Supervisor" && !existingUserById && !department) {
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
