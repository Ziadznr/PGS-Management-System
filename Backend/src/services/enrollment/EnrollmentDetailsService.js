const StudentEnrollmentModel =
  require("../../models/Students/StudentEnrollmentModel");
const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const EnrollmentDetailsService = async (req) => {
  try {
    const { applicationId } = req.tempEnrollment || {};

    if (!applicationId) {
      return { status: "fail", data: "Unauthorized enrollment access" };
    }

    /* ================= LOAD APPLICATION ================= */
    const application = await AdmissionApplicationModel
      .findById(applicationId)
      .populate("department", "name")
      .populate("supervisor", "name");

    if (!application) {
      return { status: "fail", data: "Application not found" };
    }

    if (application.applicationStatus !== "DeanAccepted") {
      return {
        status: "fail",
        data: "Application not eligible for enrollment"
      };
    }

    /* ================= LOAD ENROLLMENT (DRAFT IF EXISTS) ================= */
    const enrollment = await StudentEnrollmentModel.findOne({
      application: application._id
    }).lean();

    /* ================= MERGE DATA ================= */
    return {
      status: "success",
      data: {
        applicationId: application._id,
        applicationNo: application.applicationNo,

        program: application.program,
        academicYear: application.academicYear,
        admissionSeason: application.admissionSeason,

        department: application.department,
        subject: application.subject || null,

        supervisor: application.supervisor,
        supervisorNameSnapshot: application.supervisor?.name || "",

        applicantName: application.applicantName,
        fatherName: application.fatherName,
        motherName: application.motherName,
        dateOfBirth: application.dateOfBirth,
        sex: application.sex,
        maritalStatus: application.maritalStatus,
        nationality: application.nationality,

        email: application.email,
        mobile: application.mobile,

        permanentAddress: application.permanentAddress,
        presentAddress: application.presentAddress,

        academicRecords: application.academicRecords,
        calculatedCGPA: application.calculatedCGPA,
        totalCreditHourBachelor: application.totalCreditHourBachelor,

        /* ================= DRAFT FIELDS ================= */
        religion: enrollment?.religion || "",
        pstuRegistrationNo: enrollment?.pstuRegistrationNo || "",
        fatherMobile: enrollment?.fatherMobile || "",
        motherMobile: enrollment?.motherMobile || "",
        localGuardian: enrollment?.localGuardian || null,

        enrollmentStatus: enrollment?.enrollmentStatus || "Draft"
      }
    };

  } catch (error) {
    console.error("EnrollmentDetailsService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = EnrollmentDetailsService;
