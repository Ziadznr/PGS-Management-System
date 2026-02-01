const AdmissionApplicationModel =
  require("../models/Admission/AdmissionApplicationModel");

/* =========================================================
   AUTO DELETE WAITING APPLICATIONS (30 DAYS)
========================================================= */
const clearWaitingApplications = async () => {
  try {
    const THIRTY_DAYS_AGO = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    );

    const result = await AdmissionApplicationModel.deleteMany({
      applicationStatus: "ChairmanWaiting",
      createdAt: { $lt: THIRTY_DAYS_AGO }
    });

    console.log(
      `[CRON] Waiting applications deleted: ${result.deletedCount}`
    );
  } catch (error) {
    console.error(
      "[CRON] Error clearing waiting applications:",
      error
    );
  }
};

module.exports = clearWaitingApplications;
