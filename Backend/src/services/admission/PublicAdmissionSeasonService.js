const AdmissionSeasonModel =
  require("../../models/Admission/AdmissionSeasonModel");

const PublicAdmissionSeasonService = async () => {
  try {
    const today = new Date();

    const seasons = await AdmissionSeasonModel.find({
      isActive: true,
      isLocked: false,
      applicationStartDate: { $lte: today },
      applicationEndDate: { $gte: today }
    })
      .sort({ createdAt: -1 })
      .lean();

    return {
      status: "success",
      data: seasons
    };

  } catch (error) {
    return { status: "fail", data: error.message };
  }
};

module.exports = PublicAdmissionSeasonService;
