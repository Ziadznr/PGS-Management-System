const AdmissionSeasonModel =
  require("../../models/Admission/AdmissionSeasonModel");

const PublicAdmissionSeasonService = async () => {
  try {
    const seasons = await AdmissionSeasonModel.find({
      isActive: true,
      isLocked: false
    })
      .sort({ createdAt: -1 })
      .lean();

    return {
      status: "success",
      data: seasons
    };

  } catch (error) {
    return {
      status: "fail",
      data: error.message
    };
  }
};

module.exports = PublicAdmissionSeasonService;
