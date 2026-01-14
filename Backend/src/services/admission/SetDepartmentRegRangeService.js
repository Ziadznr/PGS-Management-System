const DepartmentRegistrationRangeModel =
  require("../../models/Admission/DepartmentRegistrationRangeModel");

// =================================================
// CREATE or UPDATE (ADMIN ONLY)
// =================================================
exports.CreateOrUpdate = async (req) => {
  try {
    // 🔒 STRICT ADMIN CHECK
    if (!req.user || req.user.role !== "admin") {
      return { status: "fail", data: "Unauthorized admin" };
    }

    const adminId = req.user.id;

    let {
      id,                 // optional (for update)
      admissionSeason,
      department,
      startRegNo,
      endRegNo
    } = req.body;

    startRegNo = Number(startRegNo);
    endRegNo = Number(endRegNo);

    // ---------------- VALIDATION ----------------
    if (!admissionSeason || !department) {
      return { status: "fail", data: "All fields are required" };
    }

    if (isNaN(startRegNo) || isNaN(endRegNo)) {
      return { status: "fail", data: "Invalid registration numbers" };
    }

    if (startRegNo >= endRegNo) {
      return {
        status: "fail",
        data: "Start registration number must be less than end number"
      };
    }

    // ================= UPDATE =================
    if (id) {
      const range = await DepartmentRegistrationRangeModel.findById(id);

      if (!range) {
        return { status: "fail", data: "Registration range not found" };
      }

      // 🔒 Enrollment protection
      if (range.currentRegNo > range.startRegNo) {
        return {
          status: "fail",
          data: "Cannot update range after enrollment started"
        };
      }

      range.startRegNo = startRegNo;
      range.endRegNo = endRegNo;
      // ❌ do NOT reset currentRegNo

      await range.save();

      return {
        status: "success",
        data: "Department registration range updated successfully"
      };
    }

    // ================= CREATE =================
    const exists = await DepartmentRegistrationRangeModel.findOne({
      admissionSeason,
      department
    });

    if (exists) {
      return {
        status: "fail",
        data: "Registration range already exists for this department"
      };
    }

    const newRange = await DepartmentRegistrationRangeModel.create({
      admissionSeason,
      department,
      startRegNo,
      endRegNo,
      currentRegNo: startRegNo,
      createdBy: adminId
    });

    return {
      status: "success",
      data: newRange
    };

  } catch (error) {
    return { status: "fail", data: error.message };
  }
};

// =================================================
// LIST (Season-wise)
// =================================================
exports.ListBySeason = async (req) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return { status: "fail", data: "Unauthorized admin" };
    }

    const { admissionSeason } = req.params;

    // ✅ CONDITIONALLY BUILD QUERY
    const query = admissionSeason
      ? { admissionSeason }
      : {}; // 🔥 EMPTY = ALL SEASONS

    const data = await DepartmentRegistrationRangeModel.find(query)
      .populate("department", "name")
      .populate("admissionSeason", "seasonName academicYear") // ✅ already correct
      .sort({ "admissionSeason.createdAt": -1, startRegNo: 1 })
      .lean();

    return { status: "success", data };

  } catch (error) {
    return { status: "fail", data: error.message };
  }
};



// =================================================
// DELETE (ADMIN ONLY)
// =================================================
exports.Delete = async (req) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return { status: "fail", data: "Unauthorized admin" };
    }

    const { id } = req.params;

    const range = await DepartmentRegistrationRangeModel.findById(id);

    if (!range) {
      return { status: "fail", data: "Range not found" };
    }

    // 🔒 Enrollment protection
    if (range.currentRegNo > range.startRegNo) {
      return {
        status: "fail",
        data: "Cannot delete range after enrollment started"
      };
    }

    await range.deleteOne();

    return {
      status: "success",
      data: "Registration range deleted successfully"
    };

  } catch (error) {
    return { status: "fail", data: error.message };
  }
};
