// services/admission/CheckPaymentService.js

const AdmissionPaymentModel =
  require("../../models/Admission/AdmissionPaymentModel");

const CheckPaymentService = async (req, res) => {
  try {
    const { email, admissionSeason, program } = req.body;

    if (!email || !admissionSeason || !program) {
      return res.status(400).json({
        status: "fail",
        data: "Email, admission season and program are required"
      });
    }

    const payment = await AdmissionPaymentModel.findOne({
      email: email.toLowerCase(),
      admissionSeason,
      program,
      status: "SUCCESS"
    }).select("_id transactionId createdAt");

    if (!payment) {
      return res.status(200).json({
        status: "success",
        data: {
          isPaid: false
        }
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        isPaid: true,
        transactionId: payment.transactionId,
        paidAt: payment.createdAt
      }
    });

  } catch (error) {
    console.error("Payment check error:", error);
    return res.status(500).json({
      status: "fail",
      data: error.message
    });
  }
};

module.exports = CheckPaymentService;
