const AdmissionSeasonModel =
  require("../../models/Admission/AdmissionSeasonModel");

const CreateAdmissionSeasonService = async (req) => {
  try {
    const { seasonName, academicYear } = req.body;

    // ✅ Basic validation
    if (!seasonName || !academicYear) {
      return { status: "fail", data: "Season name and academic year are required" };
    }

    const season = await AdmissionSeasonModel.create({
      seasonName,
      academicYear,
      createdBy: req.admin.email
    });

    return { status: "success", data: season };

  } catch (error) {

    // ✅ Duplicate season handling
    if (error.code === 11000) {
      return {
        status: "fail",
        data: "This admission season already exists"
      };
    }

    return { status: "fail", data: error.message };
  }
};

module.exports = CreateAdmissionSeasonService;
