const StudentEnrollmentModel =
  require("../../models/Students/StudentEnrollmentModel");
const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

/* ======================================================
   CREATE / UPDATE ENROLLMENT (DRAFT ONLY)
====================================================== */
const CreateOrUpdateEnrollmentService = async (req) => {
  try {
    const {
      applicationId,
      religion,
      pstuRegistrationNo,
      fatherMobile,
      motherMobile,
      localGuardian
    } = req.body;

    /* ================= BASIC VALIDATION ================= */
    if (!applicationId) {
      return { status: "fail", data: "Application ID required" };
    }

    if (!religion) {
      return { status: "fail", data: "Religion is required" };
    }

    if (
      !localGuardian?.name ||
      !localGuardian?.address ||
      !localGuardian?.mobile
    ) {
      return {
        status: "fail",
        data: "Local guardian name, address and mobile are required"
      };
    }

    /* ================= LOAD APPLICATION ================= */
    const application = await AdmissionApplicationModel
      .findById(applicationId)
      .populate("department", "name")
      .populate("supervisor", "name");

    if (!application) {
      return { status: "fail", data: "Invalid application" };
    }

    if (application.applicationStatus !== "DeanAccepted") {
      return {
        status: "fail",
        data: "Application not eligible for enrollment"
      };
    }

    /* ================= AGE CALCULATION ================= */
    const dob = new Date(application.dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    if (
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() &&
        today.getDate() < dob.getDate())
    ) {
      age--;
    }

    /* ================= CHECK EXISTING ENROLLMENT ================= */
    let enrollment = await StudentEnrollmentModel.findOne({
      application: application._id
    });

    /* ================= LOCK AFTER SUBMIT ================= */
    if (
      enrollment &&
      enrollment.enrollmentStatus !== "Draft"
    ) {
      return {
        status: "fail",
        data: "Enrollment already submitted and cannot be modified"
      };
    }

    /* ================= SNAPSHOT PAYLOAD ================= */
    const payload = {
      application: application._id,
      applicationNo: application.applicationNo,

      /* PROGRAM INFO */
      program: application.program,
      admissionSeason: application.admissionSeason,
      academicYear: application.academicYear,
      department: application.department,
      subject: application.subject || null,

      supervisor: application.supervisor,
      supervisorNameSnapshot: application.supervisor?.name || "",

      /* BIO */
      applicantName: application.applicantName,
      fatherName: application.fatherName,
      motherName: application.motherName,
      dateOfBirth: application.dateOfBirth,
      ageAtEnrollment: age,
      sex: application.sex,
      maritalStatus: application.maritalStatus,
      nationality: application.nationality,
      religion,

      /* CONTACT */
      email: application.email,
      mobile: application.mobile,

      /* OPTIONAL */
      pstuRegistrationNo: pstuRegistrationNo || "",
      fatherMobile: fatherMobile || "",
      motherMobile: motherMobile || "",

      /* ADDRESS */
      permanentAddress: application.permanentAddress,
      presentAddress: application.presentAddress,

      /* LOCAL GUARDIAN */
      localGuardian,

      /* ACADEMIC */
      academicRecords: application.academicRecords,
      calculatedCGPA: application.calculatedCGPA,
      totalCreditHourBachelor: application.totalCreditHourBachelor
    };

    /* ================= CREATE OR UPDATE ================= */
    if (enrollment) {
      await StudentEnrollmentModel.updateOne(
        { _id: enrollment._id },
        { $set: payload }
      );
    } else {
      enrollment = await StudentEnrollmentModel.create(payload);
    }

    return {
      status: "success",
      data: {
        enrollmentId: enrollment._id,
        enrollmentStatus: enrollment.enrollmentStatus
      }
    };

  } catch (error) {
    console.error("CreateOrUpdateEnrollmentService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = CreateOrUpdateEnrollmentService;
