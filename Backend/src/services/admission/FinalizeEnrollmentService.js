const bcrypt = require("bcryptjs");

const UsersModel = require("../../models/Users/UsersModel");
const StudentEnrollmentModel =
  require("../../models/Students/StudentEnrollmentModel");
const DepartmentRegistrationRangeModel =
  require("../../models/Admission/DepartmentRegistrationRangeModel");
const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const FinalizeEnrollmentService = async (req) => {
  try {
    const { applicationId, password } = req.body;

    // ================= 1️⃣ FETCH APPLICATION =================
    const application = await AdmissionApplicationModel.findOne({
      _id: applicationId,
      applicationStatus: "DeanApproved",
      enrollmentStatus: "Pending"
    }).populate("department supervisor");

    if (!application) {
      return {
        status: "fail",
        data: "Invalid or already processed application"
      };
    }

    // ================= 2️⃣ TEMP ACCESS VALIDATION =================
    const temp = application.temporaryLogin;

    if (!temp || !temp.isUsed) {
      return {
        status: "fail",
        data: "Temporary enrollment authorization not verified"
      };
    }

    if (temp.expiresAt < new Date()) {
      // ❌ EXPIRED → DISQUALIFY
      application.applicationStatus = "DeanRejected";
      application.remarks = "Enrollment time expired";
      await application.save();

      // 🔁 Promote waiting candidate
      await promoteWaitingCandidate(application.supervisor, application.department);

      return {
        status: "fail",
        data: "Enrollment time expired. Application disqualified."
      };
    }

    // ================= 3️⃣ REGISTRATION RANGE =================
    const range = await DepartmentRegistrationRangeModel.findOne({
      admissionSeason: application.admissionSeason,
      department: application.department._id
    });

    if (!range || range.currentRegNo > range.endRegNo) {
      return {
        status: "fail",
        data: "Department registration capacity exhausted"
      };
    }

    const registrationNumber = range.currentRegNo;
    range.currentRegNo += 1;
    await range.save();

    // ================= 4️⃣ CREATE STUDENT USER =================
    const exists = await UsersModel.findOne({
      email: application.email.toLowerCase()
    });

    if (exists) {
      return {
        status: "fail",
        data: "Student account already exists"
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const studentUser = await UsersModel.create({
      name: application.applicantName,
      email: application.email.toLowerCase(),
      phone: application.mobile,
      password: hashedPassword,
      role: "Student",
      department: application.department._id,
      isSelfRegistered: false,
      isEnrolled: true,
      isFirstLogin: true
    });

    // ================= 5️⃣ CREATE ENROLLMENT =================
    const enrollment = await StudentEnrollmentModel.create({
      application: application._id,
      user: studentUser._id,
      admissionSeason: application.admissionSeason,
      department: application.department._id,
      supervisor: application.supervisor._id,
      registrationNumber,
      studentId: `PGS-${registrationNumber}`,
      enrollmentStatus: "Completed",
      enrolledAt: new Date()
    });

    // ================= 6️⃣ FINALIZE APPLICATION =================
    application.enrollmentStatus = "Completed";
    application.applicationStatus = "Enrolled";
    application.enrolledStudent = studentUser._id;

    // 🔒 HARD DISABLE TEMP LOGIN
    application.temporaryLogin = null;

    await application.save();

    return {
      status: "success",
      data: {
        studentId: enrollment.studentId,
        registrationNumber,
        email: studentUser.email
      }
    };

  } catch (error) {
    console.error("FinalizeEnrollmentService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = FinalizeEnrollmentService;

/* ================= HELPER ================= */

async function promoteWaitingCandidate(supervisorId, departmentId) {
  const nextWaiting = await AdmissionApplicationModel.findOne({
    supervisor: supervisorId,
    department: departmentId,
    applicationStatus: "DeanWaiting"
  }).sort({ totalScore: -1, createdAt: 1 });

  if (!nextWaiting) return;

  nextWaiting.applicationStatus = "DeanApproved";

  // ⏳ New 7-day window
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  nextWaiting.temporaryLogin = {
    tempId: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
    password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
    expiresAt,
    isUsed: false
  };

  await nextWaiting.save();
}
