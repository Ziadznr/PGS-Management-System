const DepartmentModel = require("../../models/Departments/DepartmentModel");
const UsersModel = require("../../models/Users/UsersModel");
const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");
const AdmissionSeasonModel =
  require("../../models/Admission/AdmissionSeasonModel");
const SendEmailUtility = require("../../utility/SendEmailUtility");

/* =================================================
   HELPER: CALCULATE CGPA FROM COURSES
================================================= */
const calculateCGPAFromCourses = (courses = []) => {
  let totalCredits = 0;
  let totalPoints = 0;

  for (const c of courses) {
    if (
      typeof c.creditHour !== "number" ||
      typeof c.gradePoint !== "number" ||
      c.gradePoint < 0 ||
      c.gradePoint > 4
    ) {
      return null;
    }

    totalCredits += c.creditHour;
    totalPoints += c.creditHour * c.gradePoint;
  }

  if (totalCredits === 0) return null;
  return Number((totalPoints / totalCredits).toFixed(2));
};

const ApplyForAdmissionService = async (req) => {
  try {
    const {
      program,
      admissionSeason,

      department,
      supervisor,

      applicantName,
      email,
      mobile,
      permanentAddress,
      presentAddress,

      academicRecords,
      isPSTUStudent,
      pstuBScInfo,
      pstuLastSemesterCourses,

      isInService,
      serviceInfo,

      numberOfPublications,
      publications,

      declarationAccepted
    } = req.body;

    /* =================================================
       1️⃣ BASIC VALIDATION
    ================================================= */
    if (!applicantName || !email || !mobile) {
      return { status: "fail", data: "Name, email and mobile are required" };
    }

    if (!program || !admissionSeason || !department || !supervisor) {
      return {
        status: "fail",
        data: "Program, season, department and supervisor are required"
      };
    }

    if (!Array.isArray(academicRecords) || academicRecords.length === 0) {
      return { status: "fail", data: "Academic records are required" };
    }

    if (typeof isPSTUStudent !== "boolean") {
      return { status: "fail", data: "PSTU status is required" };
    }

    if (!declarationAccepted) {
      return { status: "fail", data: "Declaration must be accepted" };
    }

    /* =================================================
       2️⃣ ADMISSION SEASON
    ================================================= */
    const season = await AdmissionSeasonModel.findOne({
      _id: admissionSeason,
      isLocked: false,
      isActive: true
    });

    if (!season) {
      return { status: "fail", data: "Invalid or closed admission season" };
    }

    /* =================================================
       3️⃣ DUPLICATE CHECK
    ================================================= */
    const exists = await AdmissionApplicationModel.findOne({
      admissionSeason,
      email: email.toLowerCase()
    });

    if (exists) {
      return { status: "fail", data: "Already applied in this season" };
    }

    /* =================================================
       4️⃣ DEPARTMENT & SUPERVISOR
    ================================================= */
    const dept = await DepartmentModel.findById(department);
    if (!dept) {
      return { status: "fail", data: "Invalid department" };
    }

    const sup = await UsersModel.findOne({
      _id: supervisor,
      role: "Supervisor",
      department,
      isActive: true
    });

    if (!sup) {
      return { status: "fail", data: "Invalid supervisor" };
    }

    /* =================================================
       5️⃣ ACADEMIC RULES
    ================================================= */
    const hasSSC = academicRecords.some(r => r.examLevel === "SSC");
    const hasHSC = academicRecords.some(r => r.examLevel === "HSC");

    if (!hasSSC || !hasHSC) {
      return { status: "fail", data: "SSC and HSC results are required" };
    }

    if (program === "PhD") {
      const hasMS = academicRecords.some(
        r => ["MS", "MBA"].includes(r.examLevel) && r.isFinal
      );
      if (!hasMS) {
        return {
          status: "fail",
          data: "Final MS/MBA result is required for PhD"
        };
      }
    } else {
      const hasBachelor = academicRecords.some(
        r => ["BSc", "BBA"].includes(r.examLevel) && r.isFinal
      );
      if (!hasBachelor) {
        return {
          status: "fail",
          data: "Final BSc/BBA result is required"
        };
      }
    }

    /* =================================================
       6️⃣ PSTU LOGIC (ONLY MS / MBA)
    ================================================= */
    let calculatedCGPA = null;

    if (isPSTUStudent && ["MS", "MBA"].includes(program)) {
      if (
        !pstuBScInfo ||
        !pstuBScInfo.registrationNo ||
        !pstuBScInfo.session
      ) {
        return {
          status: "fail",
          data: "PSTU registration number and session required"
        };
      }

      if (
        !Array.isArray(pstuLastSemesterCourses) ||
        pstuLastSemesterCourses.length === 0
      ) {
        return {
          status: "fail",
          data: "Last semester course results required"
        };
      }

      calculatedCGPA = calculateCGPAFromCourses(pstuLastSemesterCourses);

      if (calculatedCGPA === null) {
        return {
          status: "fail",
          data: "Invalid grade or credit hour"
        };
      }
    }

    /* =================================================
       7️⃣ PUBLICATIONS VALIDATION
    ================================================= */
    if (numberOfPublications > 0) {
      if (
        !Array.isArray(publications) ||
        publications.length !== numberOfPublications ||
        publications.some(p => !p)
      ) {
        return {
          status: "fail",
          data: "All publication links must be provided"
        };
      }
    }

    /* =================================================
       8️⃣ ADDRESS
    ================================================= */
    const finalPresentAddress =
      JSON.stringify(permanentAddress) === JSON.stringify(presentAddress)
        ? permanentAddress
        : presentAddress;

    /* =================================================
       9️⃣ APPLICATION NO
    ================================================= */
    const applicationNo =
      `PGS-${season.academicYear}-${Math.floor(
        100000 + Math.random() * 900000
      )}`;

    /* =================================================
       🔟 SAVE APPLICATION
    ================================================= */
    const application = await AdmissionApplicationModel.create({
      program,
      admissionSeason,
      academicYear: season.academicYear,

      department,
      supervisor,

      applicantName,
      email: email.toLowerCase(),
      mobile,

      permanentAddress,
      presentAddress: finalPresentAddress,

      academicRecords,
      isPSTUStudent,
      pstuBScInfo,
      pstuLastSemesterCourses,
      calculatedCGPA,

      isInService,
      serviceInfo,

      numberOfPublications,
      publications,

      academicQualificationPoints: 0,
      supervisorRank: null,
      isWithinSupervisorQuota: false,
      selectionRound: 1,

      declarationAccepted,

      applicationNo,
      applicationStatus: "Submitted"
    });

    /* =================================================
       🔔 EMAIL
    ================================================= */
    await SendEmailUtility(
      application.email,
      `
Dear ${application.applicantName},

Your admission application has been submitted successfully.

Application No : ${application.applicationNo}
Program        : ${program}
Department     : ${dept.name}
Supervisor     : ${sup.name}

Regards,
PGS Admission Office
      `,
      "PGS Admission Application Submitted"
    );

    return {
      status: "success",
      data: {
        applicationNo: application.applicationNo,
        applicationStatus: application.applicationStatus
      }
    };

  } catch (error) {
    console.error("ApplyForAdmissionService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = ApplyForAdmissionService;
