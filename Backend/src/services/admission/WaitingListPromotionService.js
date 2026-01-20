const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const SendEmailUtility =
  require("../../utility/SendEmailUtility");

const MAX_PER_SUPERVISOR = 10;

const WaitingListPromotionService = async ({
  supervisorId,
  admissionSeason
}) => {
  try {
    // ================= 1️⃣ COUNT CURRENTLY ACCEPTED =================
    const acceptedCount = await AdmissionApplicationModel.countDocuments({
      supervisor: supervisorId,
      admissionSeason,
      applicationStatus: "DeanAccepted"
    });

    if (acceptedCount >= MAX_PER_SUPERVISOR) {
      return { status: "success", data: "No promotion needed" };
    }

    // ================= 2️⃣ GET TOP WAITING =================
    const waitingCandidate =
      await AdmissionApplicationModel.findOne({
        supervisor: supervisorId,
        admissionSeason,
        applicationStatus: "ChairmanWaiting"
      }).sort({
        academicQualificationPoints: -1,
        createdAt: 1
      });

    if (!waitingCandidate) {
      return { status: "success", data: "No waiting candidates" };
    }

    // ================= 3️⃣ TEMP LOGIN =================
    const tempId = crypto.randomInt(1000000000, 9999999999).toString();
    const rawPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    waitingCandidate.applicationStatus = "DeanAccepted";
    waitingCandidate.selectionRound += 1;

    waitingCandidate.temporaryLogin = {
      tempId,
      password: hashedPassword,
      expiresAt,
      isUsed: false
    };

    waitingCandidate.approvalLog.push({
      role: "Dean",
      decision: "Approved",
      remarks: "Promoted from waiting list"
    });

    await waitingCandidate.save();

    // ================= 4️⃣ EMAIL =================
    await SendEmailUtility(
      waitingCandidate.email,
      `
Dear ${waitingCandidate.applicantName},

You have been PROMOTED from the waiting list.

Temporary Enrollment Credentials:
Login ID : ${tempId}
Password : ${rawPassword}

⏳ Valid for 7 days only.

Regards,
PGS Admission Office
      `,
      "PGS Admission – Promotion Notice"
    );

    return {
      status: "success",
      data: {
        applicationId: waitingCandidate._id,
        tempLoginId: tempId
      }
    };

  } catch (error) {
    console.error("WaitingListPromotionService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = WaitingListPromotionService;
