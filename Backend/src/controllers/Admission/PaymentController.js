const AdmissionPaymentModel = require("../../models/Admission/AdmissionPaymentModel");

/* ================= SUCCESS ================= */
exports.Success = async (req, res) => {
  const { tran_id } = req.params;

  await AdmissionPaymentModel.findOneAndUpdate(
    { transactionId: tran_id },
    { status: "SUCCESS" }
  );

  // Redirecting to ApplyAdmissionPage with the paid query parameter
  res.redirect(
  `http://localhost:5173/ApplyAdmissionPage?paid=true&tran_id=${tran_id}`
);
};

/* ================= FAIL ================= */
exports.Fail = async (req, res) => {
  const { tran_id } = req.params;

  await AdmissionPaymentModel.findOneAndUpdate(
    { transactionId: tran_id },
    { status: "FAILED" }
  );

  res.redirect("http://localhost:5173/ApplyAdmissionPage");
};

/* ================= CANCEL ================= */
exports.Cancel = async (req, res) => {
  const { tran_id } = req.params;

  await AdmissionPaymentModel.findOneAndUpdate(
    { transactionId: tran_id },
    { status: "CANCELLED" }
  );

  res.redirect("http://localhost:5173/ApplyAdmissionPage");
};
