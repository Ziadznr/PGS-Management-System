const AdmissionSeasonModel =
  require("../../models/Admission/AdmissionSeasonModel");

// ================= CREATE =================
const CreateAdmissionSeasonService = async (req) => {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return { status: "fail", data: "Unauthorized admin" };
    }

    const { seasonName, academicYear } = req.body;

    // ✅ Basic validation
    if (!seasonName || !academicYear) {
      return {
        status: "fail",
        data: "Season name and academic year are required"
      };
    }

    // ✅ Create season
    const season = await AdmissionSeasonModel.create({
      seasonName,
      academicYear,
      createdBy: adminId
    });

    return {
      status: "success",
      data: season
    };

  } catch (error) {
    // 🔒 Duplicate season protection
    if (error.code === 11000) {
      return {
        status: "fail",
        data: "This admission season already exists"
      };
    }

    return {
      status: "fail",
      data: error.message
    };
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

    return {
      status: "success",
      data
    };

  } catch (error) {
    return {
      status: "fail",
      data: error.message
    };
  }
};

module.exports = CreateAdmissionSeasonService;
