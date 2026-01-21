const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

module.exports = async (application) => {
  const dir = path.join(__dirname, "../../storage/pdfs");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${application.applicationNo}.pdf`);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(fs.createWriteStream(filePath));

  /* ================= HEADER ================= */
  doc.fontSize(16).text(
    "PATUAKHALI SCIENCE AND TECHNOLOGY UNIVERSITY",
    { align: "center" }
  );
  doc.fontSize(14).text(
    "Postgraduate Admission Application",
    { align: "center" }
  );

  doc.moveDown();

  /* ================= WATERMARK ================= */
  doc.save();
  doc.rotate(-45, { origin: [300, 300] });
  doc.fontSize(50).fillColor("gray", 0.2)
     .text("PGS ADMISSION", 100, 300);
  doc.restore();
  doc.fillColor("black");

  /* ================= BASIC INFO ================= */
  doc.fontSize(11);
  doc.text(`Application No: ${application.applicationNo}`);
  doc.text(`Name: ${application.applicantName}`);
  doc.text(`Program: ${application.program}`);
  doc.text(`Department: ${application.department.name}`);
  doc.text(`Supervisor: ${application.supervisor.name}`);
  doc.text(`Email: ${application.email}`);
  doc.text(`Mobile: ${application.mobile}`);
  doc.moveDown();

  /* ================= PAYMENT ================= */
  doc.fontSize(12).text("Payment Information", { underline: true });
  doc.fontSize(11);
  doc.text(`Transaction ID: ${application.payment.transactionId}`);
  doc.text(`Amount: ৳100`);
  doc.text(`Status: SUCCESS`);
  doc.moveDown();

  /* ================= ACADEMIC ================= */
  doc.fontSize(12).text("Academic Records", { underline: true });
  doc.fontSize(11);
  application.academicRecords.forEach(r => {
    doc.text(
      `${r.examLevel}: ${r.cgpa}/${r.cgpaScale} (${r.institution}, ${r.passingYear})`
    );
  });

  /* ================= QR CODE ================= */
  const qrData = JSON.stringify({
    applicationNo: application.applicationNo,
    email: application.email,
    transactionId: application.payment.transactionId
  });

  const qrImage = await QRCode.toDataURL(qrData);

  doc.moveDown();
  doc.text("Verification QR Code:");
  doc.image(qrImage, {
    fit: [120, 120],
    align: "left"
  });

  doc.end();

  return filePath;
};
