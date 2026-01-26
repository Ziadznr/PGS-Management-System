const SSLCommerzPayment = require("sslcommerz-lts");
const AdmissionPaymentModel =
  require("../../models/Admission/AdmissionPaymentModel");

const store_id = "pstup696f77702c3ae";
const store_passwd = "pstup696f77702c3ae@ssl";
const is_live = false; // true for production

const InitiatePaymentService = async (req, res) => {
  try {
    const { email, admissionSeason, program } = req.body;

    /* ================= VALIDATION ================= */
    if (!email || !admissionSeason || !program) {
      return res.status(400).json({
        status: "fail",
        data: "Email, admission season and program are required"
      });
    }

    /* ================= DUPLICATE SUCCESS CHECK =================
       Allow retry if INITIATED / FAILED
       Block only if SUCCESS exists
    ============================================================ */
    const exists = await AdmissionPaymentModel.findOne({
      email: email.toLowerCase(),
      admissionSeason,
      program,
      status: "SUCCESS"
    });

    if (exists) {
      return res.status(400).json({
        status: "fail",
        data: "Application fee already paid for this program"
      });
    }

    const transactionId = "PGS-" + Date.now();

    /* ================= SAVE INITIATED PAYMENT ================= */
    await AdmissionPaymentModel.create({
      email: email.toLowerCase(),
      program,
      admissionSeason,
      amount: 100,
      transactionId,
      status: "INITIATED"
    });

    /* ================= SSLCOMMERZ ================= */
    const sslcz = new SSLCommerzPayment(
      store_id,
      store_passwd,
      is_live
    );

    const data = {
      total_amount: 100,
      currency: "BDT",
      tran_id: transactionId,

      success_url:
        `http://localhost:5000/api/v1/payment/success/${transactionId}`,
      fail_url:
        `http://localhost:5000/api/v1/payment/fail/${transactionId}`,
      cancel_url:
        `http://localhost:5000/api/v1/payment/cancel/${transactionId}`,

      cus_name: "PGS Applicant",
      cus_email: email,
      cus_phone: "01700000000",

      shipping_method: "NO",
      product_name: `PGS Admission Fee (${program})`,
      product_category: "Education",
      product_profile: "general"
    };

    const response = await sslcz.init(data);

    return res.status(200).json({
      status: "success",
      data: response.GatewayPageURL
    });

  } catch (err) {
    console.error("Payment initiate error:", err);

    return res.status(500).json({
      status: "fail",
      data: err.message
    });
  }
};

module.exports = InitiatePaymentService;
