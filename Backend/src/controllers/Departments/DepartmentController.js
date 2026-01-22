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
  if (!req.body.name) {
    return res.status(400).json({
      status: "fail",
      message: "Department name is required"
    });
  }

  const result = await CreateService(req, DepartmentModel);
  res.status(200).json(result);
};

/* =========================
   UPDATE DEPARTMENT
========================= */
exports.UpdateDepartment = async (req, res) => {
  const result = await UpdateService(req, DepartmentModel);
  res.status(200).json(result);
};

/* =========================
   LIST DEPARTMENTS
========================= */
exports.ListDepartments = async (req, res) => {
  const searchKeyword = req.params.searchKeyword || "0";

  const SearchArray = [
    {
      name: {
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
    { _id: 1, name: 1 }
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
