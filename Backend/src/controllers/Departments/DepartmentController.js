const mongoose = require("mongoose");
const DepartmentModel = require("../../models/Departments/DepartmentModel");
const UsersModel = require("../../models/Users/UsersModel");

const CreateService = require("../../services/common/CreateService");
const UpdateService = require("../../services/common/UpdateService");
const DeleteService = require("../../services/common/DeleteService");
const ListService = require("../../services/common/ListService");
const DetailsByIDService = require("../../services/common/DetailsByIDService");
const DropDownService = require("../../services/common/DropDownService");
const CheckAssociateService = require("../../services/common/CheckAssociateService");

/* =========================
   CREATE DEPARTMENT
========================= */
exports.CreateDepartment = async (req, res) => {
  try {
    const { program, departmentName, departmentCode } = req.body;

    if (!program || !departmentName || !departmentCode) {
      return res.status(400).json({
        status: "fail",
        message: "Program, department name, and department code are required"
      });
    }

    const result = await CreateService(req, DepartmentModel);
    res.status(200).json(result);

  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({
        status: "fail",
        message: "Department already exists for this program"
      });
    }

    res.status(500).json({ status: "fail", message: e.toString() });
  }
};



/* =========================
   UPDATE DEPARTMENT
========================= */
exports.UpdateDepartment = async (req, res) => {
  try {
    const result = await UpdateService(req, DepartmentModel);
    res.status(200).json(result);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({
        status: "fail",
        message: "Another department with same code exists in this program"
      });
    }
    res.status(500).json({ status: "fail", message: e.toString() });
  }
};


/* =========================
   LIST DEPARTMENTS
========================= */
exports.ListDepartments = async (req, res) => {
  const searchKeyword = req.params.searchKeyword || "0";

  const SearchArray = [
    {
      departmentName: {
        $regex: searchKeyword === "0" ? "" : searchKeyword,
        $options: "i"
      }
    },
    {
      departmentCode: {
        $regex: searchKeyword === "0" ? "" : searchKeyword,
        $options: "i"
      }
    }
  ];

  const result = await ListService(req, DepartmentModel, SearchArray);
  res.status(200).json(result);
};


/* =========================
   DEPARTMENT DETAILS
========================= */
exports.DepartmentDetailsByID = async (req, res) => {
  const result = await DetailsByIDService(req, DepartmentModel);
  res.status(200).json(result);
};


exports.DeleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await DepartmentModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        status: "fail", 
        message: "Department not found" 
      });
    }

    res.status(200).json({
      status: "success",
      message: "Department deactivated successfully"
    });
  } catch (e) {
    // This ensures a response is sent even if the database fails
    res.status(500).json({ status: "fail", message: e.toString() });
  }
};

/* =========================
   DEPARTMENT DROPDOWN
========================= */
exports.DepartmentDropdown = async (req, res) => {
  const result = await DropDownService(
    req,
    DepartmentModel,
    {
      _id: 1,
      departmentName: 1,
      departmentCode: 1,
      program: 1
    },{ isActive: true }
  );

  res.status(200).json(result);
};


/* =========================
   SUBJECT DROPDOWN BY DEPARTMENT
========================= */
exports.DepartmentSubjectDropdown = async (req, res) => {
  const { departmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(departmentId)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid department ID"
    });
  }

  const department = await DepartmentModel.findById(
    departmentId,
    { offeredSubjects: 1 }
  ).lean();

  if (!department) {
    return res.status(404).json({
      status: "fail",
      message: "Department not found"
    });
  }

  // Only active subjects
  const subjects =
    department.offeredSubjects?.filter(s => s.isActive) || [];

  res.status(200).json({
    status: "success",
    data: subjects
  });
};


exports.DepartmentDropdownByProgram = async (req, res) => {
  const { program } = req.params;

  const departments = await DepartmentModel.find(
    { program, isActive: true },
    { departmentName: 1, departmentCode: 1 }
  ).lean();

  res.status(200).json({
    status: "success",
    data: departments
  });
};

