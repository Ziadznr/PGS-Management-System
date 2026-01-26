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

  /* ================= WATERMARK ================= */
  doc.save();
  doc.rotate(-45, { origin: [300, 400] });
  doc.fontSize(50).fillColor("gray", 0.15).text("PGS ADMISSION", 100, 400);
  doc.restore();
  doc.fillColor("black");

  /* ================= HEADER (From File 2) ================= */
  doc.fontSize(14).text("PATUAKHALI SCIENCE AND TECHNOLOGY UNIVERSITY", { align: "center", bold: true });
  doc.fontSize(10).text("Dumki, Patuakhali-8602, Bangladesh", { align: "center" });
  doc.fontSize(12).text("Admission Form", { align: "center", underline: true });
  doc.moveDown();

  /* ================= APPLICANT INFO (Merged) ================= */
  doc.fontSize(10);
  const leftCol = 50;
  const rightCol = 300;

  doc.text(`Name of Student: ${application.applicantName}`, leftCol);
  doc.text(`Application No: ${application.applicationNo}`, rightCol);
  doc.text(`Address/Mobile: ${application.mobile}`, leftCol);
  doc.text(`Registration No: ${application.regNo || 'N/A'}`, rightCol);
  doc.text(`Program: ${application.program}`, leftCol);
  doc.text(`Subject Applied: ${application.department.name}`, rightCol);
  doc.text(`Semester: ${application.semester || 'Spring 2026'}`, leftCol);
  doc.text(`Proposed Supervisor: ${application.supervisor.name}`, rightCol);
  doc.moveDown();

  /* ================= GPA COUNTING TABLE (File 1 Style) ================= */
  doc.fontSize(11).text("Academic Evaluation (GPA Calculation)", { underline: true });
  doc.moveDown(0.5);

  const tableTop = doc.y;
  const col1 = 50, col2 = 250, col3 = 330, col4 = 410, col5 = 490;

  // Header
  doc.rect(50, tableTop, 500, 20).stroke();
  doc.fontSize(9).text("Course Title", col1 + 5, tableTop + 5);
  doc.text("GP", col3 + 5, tableTop + 5);
  doc.text("CH", col4 + 5, tableTop + 5);
  doc.text("GP x CH", col5 + 5, tableTop + 5);

  // Dynamic Rows (using application.academicRecords as mock data)
  let currentY = tableTop + 20;
  application.academicRecords.forEach((record, index) => {
    doc.rect(50, currentY, 500, 20).stroke();
    doc.text(record.examLevel || "Course " + (index+1), col1 + 5, currentY + 5);
    doc.text(record.cgpa.toString(), col3 + 5, currentY + 5);
    doc.text(record.cgpaScale.toString(), col4 + 5, currentY + 5);
    doc.text((record.cgpa * record.cgpaScale).toFixed(2), col5 + 5, currentY + 5);
    currentY += 20;
  });

  // Calculation Summary (File 1: Sum of CH and GPxCH)
  doc.rect(50, currentY, 500, 20).stroke();
  doc.text("GPA in Applied Subject:", col1 + 5, currentY + 5, { bold: true });
  doc.text(`Total GPA: ${application.payment.totalGpa || 'N/A'}`, col5 - 50, currentY + 5);
  currentY += 40;

  /* ================= COURSE ENROLMENT (File 2 Style) ================= */
  doc.y = currentY;
  doc.fontSize(11).text("Course Enrolment Details", { underline: true });
  doc.moveDown(0.5);
  
  const courseY = doc.y;
  doc.rect(50, courseY, 500, 60).stroke();
  doc.fontSize(9).text("A. Compulsory Courses:", 55, courseY + 5);
  doc.text("B. Elective Courses:", 55, courseY + 20);
  doc.text("C. Audit / Research Work:", 55, courseY + 35);
  doc.moveDown(5);

  /* ================= PAYMENT & QR CODE ================= */
  const footerY = doc.y;
  doc.fontSize(10).text("Payment Status", { underline: true });
  doc.text(`TrxID: ${application.payment.transactionId} | Amount: BDT 100 | Status: SUCCESS`);
  
  // QR Code
  const qrData = JSON.stringify({ appNo: application.applicationNo, status: "PAID" });
  const qrImage = await QRCode.toDataURL(qrData);
  doc.image(qrImage, 430, footerY - 10, { width: 80 });

  /* ================= SIGNATURE SECTION (Merged) ================= */
  doc.moveDown(4);
const sigY = doc.y;

doc.moveTo(50, sigY).lineTo(150, sigY).stroke();
doc.moveTo(225, sigY).lineTo(325, sigY).stroke();
doc.moveTo(400, sigY).lineTo(500, sigY).stroke();

  
  doc.fontSize(8);
  doc.text("Student's Signature", 50, sigY + 5, { width: 100, align: "center" });
  doc.text("Supervisor Signature", 225, sigY + 5, { width: 100, align: "center" });
  doc.text("Chairman / Dean, PGS", 400, sigY + 5, { width: 100, align: "center" });

  doc.end();
  return filePath;
};