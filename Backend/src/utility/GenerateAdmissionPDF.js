const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

module.exports = async (application) => {
  const dir = path.join(__dirname, "../../storage/pdfs");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${application.applicationNo}.pdf`);
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc.pipe(fs.createWriteStream(filePath));

  const safe = v =>
    v === undefined || v === null || Number.isNaN(v) ? "" : String(v);

  const formatDateLong = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};

  const CONTENT_X = 52;
  const logoPath = path.join(__dirname, "../../assets/ps.png");

  /* ================= WATERMARK ================= */
  if (fs.existsSync(logoPath)) {
    doc.save();
    doc.opacity(0.08);
    doc.image(logoPath, 150, 250, { width: 300 });
    doc.opacity(1);
    doc.restore();
  }

  /* ================= HEADER ================= */
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, 40, { width: 60 });
  }

  doc.font("Times-Bold")
    .fontSize(13)
    .text(
      "PATUAKHALI SCIENCE AND TECHNOLOGY UNIVERSITY",
      120,
      45,
      { align: "center" }
    );

  doc.font("Times-Roman")
    .fontSize(10)
    .text("Dumki, Patuakhali–8660, Bangladesh", { align: "center" });

  doc.moveDown(1);
  doc.font("Times-Bold")
    .fontSize(12)
    .text("APPLICATION FOR ADMISSION", {
      align: "center",
      underline: true
    });

  doc.moveDown(1);

  /* ================= BASIC INFO ================= */
  doc.font("Times-Roman").fontSize(10);
  doc.text(`Program: ${safe(application.program)}`, CONTENT_X);
  doc.text(`Department: ${safe(application.department?.name)}`, CONTENT_X);
  doc.text(`Session: ${safe(application.academicYear)}`, CONTENT_X);

  doc.moveDown(0.5);

  doc.text(`Applicant Name: ${safe(application.applicantName)}`, CONTENT_X);
  doc.text(`Father's Name: ${safe(application.fatherName)}`, CONTENT_X);
  doc.text(`Mother's Name: ${safe(application.motherName)}`, CONTENT_X);
  doc.text(`Date of Birth: ${formatDateLong(application.dateOfBirth)}`,CONTENT_X);
  doc.text(`Nationality: ${safe(application.nationality)}`, CONTENT_X);
  doc.text(`Sex: ${safe(application.sex)}`, CONTENT_X);
  doc.text(`Mobile: ${safe(application.mobile)}`, CONTENT_X);
  doc.text(`Email: ${safe(application.email)}`, CONTENT_X);

  doc.moveDown(0.8);

  /* ================= ADDRESS ================= */
  doc.font("Times-Bold").text("Present Address:", CONTENT_X);
  doc.font("Times-Roman").text(
    `${safe(application.presentAddress?.village)}, ${safe(application.presentAddress?.subDistrict)}, ${safe(application.presentAddress?.district)}`,
    CONTENT_X
  );

  doc.moveDown(0.4);
  doc.font("Times-Bold").text("Permanent Address:", CONTENT_X);
  doc.font("Times-Roman").text(
    `${safe(application.permanentAddress?.village)}, ${safe(application.permanentAddress?.subDistrict)}, ${safe(application.permanentAddress?.district)}`,
    CONTENT_X
  );

  doc.moveDown(1);

  /* ================= ACADEMIC QUALIFICATION ================= */
  doc.font("Times-Bold").text("Academic Qualification", CONTENT_X);
  doc.moveDown(0.3);

  const colAX = [CONTENT_X, 132, 232, 372, 452];
  const colAW = [80, 100, 140, 80, 80];
  const rowH = 20;

  const drawAcademicRow = (y, row) => {
    row.forEach((cell, i) => {
      doc.rect(colAX[i], y, colAW[i], rowH).stroke();
      doc.fontSize(9).text(
        safe(cell),
        colAX[i] + 4,
        y + 6,
        { width: colAW[i] - 6 }
      );
    });
  };

  let y = doc.y;
  drawAcademicRow(y, ["Exam", "Year", "Institution", "GPA", "Scale"]);
  y += rowH;

  (application.academicRecords || []).forEach(r => {
    drawAcademicRow(y, [
      r.examLevel,
      r.passingYear,
      r.institution,
      r.cgpa,
      r.cgpaScale
    ]);
    y += rowH;
  });

  doc.y = y + 6;
  doc.fontSize(10).text(
    `Total Credit Hour (Bachelor): ${safe(application.totalCreditHourBachelor)}`,
    CONTENT_X
  );

  /* ================= APPLIED SUBJECT GPA ================= */
  doc.moveDown(1);
  doc.font("Times-Bold").fontSize(11)
    .text("Applied Subject GPA Calculation", CONTENT_X);

  doc.moveDown(0.5);

  const colBX = [CONTENT_X, 122, 312, 392];
  const colBW = [70, 190, 80, 80];
  const rowH2 = 20;

  const drawCourseRow = (y, row) => {
    row.forEach((cell, i) => {
      doc.rect(colBX[i], y, colBW[i], rowH2).stroke();
      doc.fontSize(9).text(
        safe(cell),
        colBX[i] + 4,
        y + 6,
        { width: colBW[i] - 6 }
      );
    });
  };

  y = doc.y;
  drawCourseRow(y, ["Code", "Title", "CH", "GP"]);
  y += rowH2;

  (application.appliedSubjectCourses || []).forEach(c => {
    drawCourseRow(y, [
      c.courseCode,
      c.courseTitle,
      c.creditHour,
      c.gradePoint
    ]);
    y += rowH2;
  });

  doc.y = y + 6;
  doc.fontSize(10).text(
    `Total Credit Hour (Applied): ${safe(application.totalCreditHourAppliedSubject)}`,
    CONTENT_X
  );
  doc.text(`Calculated CGPA: ${safe(application.calculatedCGPA)}`, CONTENT_X);

  /* ================= SERVICE ================= */
doc.moveDown(0.8);
doc.font("Times-Bold").text("Service Status:", CONTENT_X);
doc.font("Times-Roman").text(
  `In Service: ${application.isInService ? "Yes" : "No"}`,
  CONTENT_X
);

if (application.isInService) {
  doc.text(`Position: ${safe(application.serviceInfo?.position)}`, CONTENT_X);
  doc.text(`Length of Service: ${safe(application.serviceInfo?.lengthOfService)}`, CONTENT_X);
  doc.text(`Nature of Job: ${safe(application.serviceInfo?.natureOfJob)}`, CONTENT_X);
  doc.text(`Employer: ${safe(application.serviceInfo?.employer)}`, CONTENT_X);
}

/* ================= PUBLICATIONS (END PAGE 1) ================= */
doc.moveDown(0.8);
doc.font("Times-Bold").text("Publications:", CONTENT_X);
doc.font("Times-Roman").text(
  `Number of Publications: ${safe(application.numberOfPublications)}`,
  CONTENT_X
);

(application.publications || []).slice(0, 5).forEach((p, i) => {
  doc.text(`${i + 1}. ${safe(p)}`, CONTENT_X + 10);
});

  /* ================= PAGE 2 START ================= */
  doc.addPage();

  /* ================= DECLARATION ================= */
  doc.font("Times-Bold").text("Declaration:", CONTENT_X);
  doc.font("Times-Roman").text(
    "I hereby declare that the information provided above is true and correct to the best of my knowledge.",
    CONTENT_X
  );
  doc.text(
    `Declaration Accepted: ${application.declarationAccepted ? "Yes" : "No"}`,
    CONTENT_X
  );

  /* ================= PAYMENT ================= */
  doc.moveDown(1);
  doc.font("Times-Bold").text("Payment Information", CONTENT_X);
  doc.font("Times-Roman");
  doc.text(`Application No: ${safe(application.applicationNo)}`, CONTENT_X);
  doc.text(`Transaction ID: ${safe(application.paymentTransactionId)}`, CONTENT_X);
  doc.text(`Amount: BDT 100`, CONTENT_X);
  doc.text(`Status: PAID`, CONTENT_X);

  const qr = await QRCode.toDataURL(
    JSON.stringify({ applicationNo: application.applicationNo, status: "PAID" })
  );
  doc.image(qr, 450, doc.page.height - 200, { width: 80 });

  doc.end();
  return filePath;
};
