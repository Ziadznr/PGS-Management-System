const AdmissionSeasonModel =
  require("../../models/Admission/AdmissionSeasonModel");

// ================= CREATE =================
const CreateAdmissionSeasonService = async (req) => {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return { status: "fail", data: "Unauthorized admin" };
    }

    const {
      seasonName,
      academicYear,
      applicationStartDate,
      applicationEndDate
    } = req.body;

    if (
      !seasonName ||
      !academicYear ||
      !applicationStartDate ||
      !applicationEndDate
    ) {
      return { status: "fail", data: "All fields are required" };
    }

    if (new Date(applicationStartDate) >= new Date(applicationEndDate)) {
      return {
        status: "fail",
        data: "Application start date must be before end date"
      };
    }

    const season = await AdmissionSeasonModel.create({
      seasonName,
      academicYear,
      applicationStartDate,
      applicationEndDate,
      createdBy: adminId
    });

    return { status: "success", data: season };

  } catch (error) {
    if (error.code === 11000) {
      return {
        status: "fail",
        data: "This admission season already exists"
      };
    }

    return { status: "fail", data: error.message };
  }
};

// ================= LIST =================
CreateAdmissionSeasonService.List = async (req) => {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return { status: "fail", data: "Unauthorized admin" };
    }

    const data = await AdmissionSeasonModel
      .find()
      .sort({ createdAt: -1 })
      .lean();

    return { status: "success", data };

  } catch (error) {
    return { status: "fail", data: error.message };
  }
};

module.exports = CreateAdmissionSeasonService;
