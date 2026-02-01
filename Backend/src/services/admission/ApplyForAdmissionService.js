const DepartmentModel = require("../../models/Departments/DepartmentModel");
const UsersModel = require("../../models/Users/UsersModel");
const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");
const AdmissionSeasonModel =
  require("../../models/Admission/AdmissionSeasonModel");
const AdmissionPaymentModel =
  require("../../models/Admission/AdmissionPaymentModel");
const TempUploadModel =
  require("../../models/Admission/TempUploadModel");

const SendEmailUtility = require("../../utility/SendEmailUtility");
const GenerateAdmissionPDF = require("../../utility/GenerateAdmissionPDF");

const MIN_CGPA = 2.50;

/* =================================================
   HELPER: CALCULATE CGPA FROM COURSE-WISE GPA
   Formula:
   Σ (creditHour × gradePoint) / Σ creditHour
================================================= */
const calculateCGPAFromCourses = (courses = []) => {
  let totalCredits = 0;
  let totalPoints = 0;

  for (const c of courses) {
    const creditHour = Number(c.creditHour);
    const gradePoint = Number(c.gradePoint);

    if (
      Number.isNaN(creditHour) ||
      Number.isNaN(gradePoint) ||
      creditHour <= 0 ||
      gradePoint < 0 ||
      gradePoint > 4
    ) {
      return null;
    }

    totalCredits += creditHour;
    totalPoints += creditHour * gradePoint;
  }

  if (totalCredits === 0) return null;

  return Number((totalPoints / totalCredits).toFixed(2));

  
};



const ApplyForAdmissionService = async (req) => {
  try {

    /* =================================================
       TEMP DOCUMENT MERGE
    ================================================= */
    let finalDocuments = [];
    let totalDocumentSizeKB = 0;

    if (req.body.tempId) {
      const temp = await TempUploadModel.findOne({
        tempId: req.body.tempId
      });

      if (temp) {
        finalDocuments = temp.documents;
        totalDocumentSizeKB = temp.totalSizeKB;
      }
    }

const {
  program,
  admissionSeason,
  department,
  supervisor,
  applicantName,
  fatherName,
  motherName,
  dateOfBirth,
  nationality,
  maritalStatus,
  sex,
  email,
  mobile,
  permanentAddress,
  presentAddress,

  academicRecords,
  appliedSubjectCourses,

  // ✅ NEW FIELDS
  totalCreditHourBachelor,
  isInService,
  serviceInfo,
  numberOfPublications,
  publications,
  declarationAccepted,
  tempId
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

    if (!declarationAccepted) {
      return { status: "fail", data: "Declaration must be accepted" };
    }

    /* =================================================
       2️⃣ ADMISSION SEASON VALIDATION
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
   3️⃣ DUPLICATE APPLICATION CHECK
   → Same student cannot apply twice under SAME supervisor
================================================= */
const exists = await AdmissionApplicationModel.findOne({
  admissionSeason,
  program,
  supervisor,
  email: email.toLowerCase()
});

if (exists) {
  return {
    status: "fail",
    data: "You have already applied under this supervisor"
  };
}

    /* =================================================
       4️⃣ DEPARTMENT & SUPERVISOR VALIDATION
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
        r => ["MS", "MBA", "LLM"].includes(r.examLevel) && r.isFinal
      );

      if (!hasMS) {
        return {
          status: "fail",
          data: "Final MS/MBA/LLM result is required for PhD"
        };
      }
    } else {
      const hasBachelor = academicRecords.some(
        r => ["BSc", "BBA", "LLB"].includes(r.examLevel) && r.isFinal
      );

      if (!hasBachelor) {
        return {
          status: "fail",
          data: "Final Bachelor result is required"
        };
      }
    }

    /* =================================================
   BACHELOR CGPA ELIGIBILITY (MS / MBA / LLM)
================================================= */
if (["MS", "MBA", "LLM"].includes(program)) {

  const bachelorRecord = academicRecords.find(
    r =>
      ["BSc", "BBA", "LLB"].includes(r.examLevel) &&
      r.isFinal === true
  );

  if (!bachelorRecord) {
    return {
      status: "fail",
      data: "Final Bachelor result is required"
    };
  }

  const bachelorCGPA = Number(bachelorRecord.cgpa);

  if (Number.isNaN(bachelorCGPA)) {
    return {
      status: "fail",
      data: "Invalid Bachelor CGPA"
    };
  }

  if (bachelorCGPA < 2.25) {
    return {
      status: "fail",
      data:
        "Minimum required Bachelor CGPA is 2.25 for MS/MBA/LLM programs"
    };
  }
}


    /* =================================================
       6️⃣ COURSE-WISE GPA CALCULATION
    ================================================= */
    let calculatedCGPA = null;

    if (["MS", "MBA", "LLM"].includes(program)) {
      if (
        !Array.isArray(appliedSubjectCourses) ||
        appliedSubjectCourses.length === 0
      ) {
        return {
          status: "fail",
          data: "Course-wise GPA details are required"
        };
      }

      calculatedCGPA = calculateCGPAFromCourses(appliedSubjectCourses);

      if (calculatedCGPA === null) {
        return {
          status: "fail",
          data: "Invalid course credit or grade point"
        };
      }
    }

    /* =================================================
   TOTAL APPLIED SUBJECT CREDIT HOUR (BACKEND AUTH)
================================================= */
let totalCreditHourAppliedSubject = null;

if (Array.isArray(appliedSubjectCourses)) {
  totalCreditHourAppliedSubject = appliedSubjectCourses.reduce(
    (sum, c) => sum + Number(c.creditHour || 0),
    0
  );

  totalCreditHourAppliedSubject =
    totalCreditHourAppliedSubject > 0
      ? Number(totalCreditHourAppliedSubject.toFixed(2))
      : null;
}

    /* =================================================
   CGPA ELIGIBILITY
================================================= */
let isEligibleByCGPA = true;

if (
  calculatedCGPA !== null &&
  calculatedCGPA < MIN_CGPA
) {
  isEligibleByCGPA = false;
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
       8️⃣ PAYMENT VERIFICATION
    ================================================= */
    const payment = await AdmissionPaymentModel.findOne({
      email: email.toLowerCase(),
      admissionSeason,
      program,
      status: "SUCCESS"
    });

    if (!payment) {
      return {
        status: "fail",
        data: "Application fee not paid"
      };
    }

    /* =================================================
       9️⃣ ADDRESS HANDLING
    ================================================= */
    const finalPresentAddress =
      JSON.stringify(permanentAddress) === JSON.stringify(presentAddress)
        ? permanentAddress
        : presentAddress;

    /* =================================================
       🔟 APPLICATION NUMBER
    ================================================= */
    const applicationNo =
      `PGS-${season.academicYear}-${Math.floor(
        100000 + Math.random() * 900000
      )}`;

    /* =================================================
       1️⃣1️⃣ SAVE APPLICATION
    ================================================= */
    const application = await AdmissionApplicationModel.create({
  program,
  admissionSeason,
  academicYear: season.academicYear,

  department,
  supervisor,

  applicantName,
  fatherName,
  motherName,
  dateOfBirth,
  nationality,
  maritalStatus,
  sex,

  email: email.toLowerCase(),
  mobile,

  permanentAddress,
  presentAddress: finalPresentAddress,

  academicRecords,
  appliedSubjectCourses,

  totalCreditHourBachelor,
  totalCreditHourAppliedSubject,

  calculatedCGPA,
  isEligibleByCGPA,

  isInService,
  serviceInfo,

  numberOfPublications,
  publications,

  declarationAccepted,
  payment: payment._id,

  documents: finalDocuments,
  totalDocumentSizeKB,

  applicationNo,
  applicationStatus: "Submitted"
});


    /* =================================================
       1️⃣2️⃣ POPULATE FOR PDF & EMAIL
    ================================================= */
    const populatedApplication =
      await AdmissionApplicationModel.findById(application._id)
        .populate("department", "name")
        .populate("supervisor", "name email")
        .populate("payment");

    /* =================================================
       🔔 EMAIL + PDF
    ================================================= */
    const pdfPath = await GenerateAdmissionPDF(populatedApplication);

    await SendEmailUtility(
      populatedApplication.email,
      `
Dear ${populatedApplication.applicantName},

Your admission application has been submitted successfully.

Application No        : ${populatedApplication.applicationNo}
Payment Transaction ID: ${populatedApplication.payment.transactionId}
Program               : ${program}
Department            : ${populatedApplication.department.name}
Supervisor            : ${populatedApplication.supervisor.name}

Regards,
PGS Admission Office
      `,
      "PGS Admission Application Submitted",
      [
        {
          filename: `${populatedApplication.applicationNo}.pdf`,
          path: pdfPath
        }
      ]
    );

    /* =================================================
       🧹 CLEAN TEMP UPLOAD
    ================================================= */
    if (tempId) {
      await TempUploadModel.deleteOne({ tempId });
    }

    return {
      status: "success",
      data: {
        applicationNo: populatedApplication.applicationNo,
        applicationStatus: populatedApplication.applicationStatus
      }
    };

  } catch (error) {
    console.error("ApplyForAdmissionService error:", error);
    return {
      status: "fail",
      data: "Something went wrong. Please try again later."
    };
  }
};

module.exports = ApplyForAdmissionService;
