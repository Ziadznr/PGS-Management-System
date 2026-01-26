const DepartmentRegistrationRangeModel =
  require("../../models/Admission/DepartmentRegistrationRangeModel");
const DepartmentModel =
  require("../../models/Departments/DepartmentModel");

/* =================================================
   CREATE or UPDATE (ADMIN ONLY)
================================================= */
exports.CreateOrUpdate = async (req) => {
  try {
    /* ---------- ADMIN CHECK ---------- */
    if (!req.user || req.user.role !== "admin") {
      return { status: "fail", data: "Unauthorized admin" };
    }

    const adminId = req.user.id;

    let {
      id,                 // optional (update)
      admissionSeason,
      department,
      subjectId,          // optional
      startRegNo,
      endRegNo
    } = req.body;

    startRegNo = Number(startRegNo);
    endRegNo = Number(endRegNo);

    /* ---------- BASIC VALIDATION ---------- */
    if (!admissionSeason || !department) {
      return { status: "fail", data: "Admission season and department required" };
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

    /* ---------- SUBJECT VALIDATION ---------- */
    let subjectName = null;

    if (subjectId) {
      const dept = await DepartmentModel.findById(department).lean();

      if (!dept) {
        return { status: "fail", data: "Invalid department" };
      }

      const subject = dept.offeredSubjects?.find(
        s => s.isActive && s._id.toString() === subjectId
      );

      if (!subject) {
        return {
          status: "fail",
          data: "Invalid subject for selected department"
        };
      }

      subjectName = subject.name;
    }

    /* =================================================
       UPDATE
    ================================================= */
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

      // 🔒 OVERLAP CHECK (excluding self)
      const overlap = await DepartmentRegistrationRangeModel.findOne({
        _id: { $ne: id },
        admissionSeason,
        department,
        subjectId: subjectId || null,
        startRegNo: { $lte: endRegNo },
        endRegNo: { $gte: startRegNo }
      });

      if (overlap) {
        return {
          status: "fail",
          data: `Overlaps with existing range (${overlap.startRegNo}-${overlap.endRegNo})`
        };
      }

      range.startRegNo = startRegNo;
      range.endRegNo = endRegNo;

      if (subjectId !== undefined) {
        range.subjectId = subjectId || null;
        range.subjectName = subjectName;
      }

      await range.save();

      return {
        status: "success",
        data: "Department registration range updated successfully"
      };
    }

    /* =================================================
       SCENARIO-B RULES
    ================================================= */

    // ❌ department-only exists → block subject-wise
    if (subjectId) {
      const deptOnlyExists =
        await DepartmentRegistrationRangeModel.exists({
          admissionSeason,
          department,
          subjectId: null
        });

      if (deptOnlyExists) {
        return {
          status: "fail",
          data: "Department-only range exists. Cannot add subject-wise ranges."
        };
      }
    }

    // ❌ subject-wise exists → block department-only
    if (!subjectId) {
      const subjectExists =
        await DepartmentRegistrationRangeModel.exists({
          admissionSeason,
          department,
          subjectId: { $ne: null }
        });

      if (subjectExists) {
        return {
          status: "fail",
          data: "Subject-wise ranges exist. Department-only range not allowed."
        };
      }
    }

    /* =================================================
       🔒 AUTO-LOCK OVERLAPPING NUMBERS (CORE FIX)
    ================================================= */
    const overlap = await DepartmentRegistrationRangeModel.findOne({
      admissionSeason,
      department,
      subjectId: subjectId || null,
      startRegNo: { $lte: endRegNo },
      endRegNo: { $gte: startRegNo }
    });

    if (overlap) {
      return {
        status: "fail",
        data: `Overlaps with existing range (${overlap.startRegNo}-${overlap.endRegNo})`
      };
    }

    /* =================================================
       CREATE
    ================================================= */
    const newRange =
      await DepartmentRegistrationRangeModel.create({
        admissionSeason,
        department,
        subjectId: subjectId || null,
        subjectName,
        startRegNo,
        endRegNo,
        currentRegNo: startRegNo,
        createdBy: adminId
      });

    return { status: "success", data: newRange };

  } catch (error) {
    return { status: "fail", data: error.message };
  }
};



// =================================================
// LIST (Season-wise OR All)
// =================================================
exports.ListBySeason = async (req) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return { status: "fail", data: "Unauthorized admin" };
    }

    const { admissionSeason } = req.params;

    const query = admissionSeason ? { admissionSeason } : {};

    const data =
      await DepartmentRegistrationRangeModel.find(query)
        .populate("department", "name")
        .populate("admissionSeason", "seasonName academicYear")
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

    const range =
      await DepartmentRegistrationRangeModel.findById(id);

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
 