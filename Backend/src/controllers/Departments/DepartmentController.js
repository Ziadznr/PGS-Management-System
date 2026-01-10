const DepartmentModel = require('../../models/Departments/DepartmentModel');
const FacultyModel = require('../../models/Faculties/FacultyModel');
const CreateService = require('../../services/common/CreateService');
const UpdateService = require('../../services/common/UpdateService');
const DeleteService = require('../../services/common/DeleteService');
const ListOneJoinService = require('../../services/common/ListOneJoinService');
const DetailsByIDService = require('../../services/common/DetailsByIDService');
const DropDownService = require('../../services/common/DepartmentByFacultyService');
const CheckAssociateService = require('../../services/common/CheckAssociateService');
const mongoose = require('mongoose');

// Example associated model: Customers
const CustomerModel = require('../../models/Users/UsersModel');

// ------------------ Create Department ------------------
exports.CreateDepartment = async (req, res) => {
    try {
        const { FacultyID } = req.body;
        const faculty = await FacultyModel.findById(FacultyID);
        if (!faculty) {
            return res.status(400).json({ status: "fail", message: "Invalid FacultyID" });
        }

        const result = await CreateService(req, DepartmentModel);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// ------------------ Update Department ------------------
exports.UpdateDepartment = async (req, res) => {
    try {
        const result = await UpdateService(req, DepartmentModel);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// ------------------ List Departments (with Faculty join) ------------------
exports.ListDepartments = async (req, res) => {
    try {
        const searchKeyword = req.params.searchKeyword || "";
        const SearchArray = [
            { Name: { $regex: searchKeyword, $options: 'i' } }
        ];

        const JoinStage = {
            $lookup: {
                from: "faculties",
                localField: "FacultyID",
                foreignField: "_id",
                as: "Faculty"
            }
        };

        const result = await ListOneJoinService(req, DepartmentModel, SearchArray, JoinStage);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// ------------------ Get Department Details by ID ------------------
exports.DepartmentDetailsByID = async (req, res) => {
    try {
        const result = await DetailsByIDService(req, DepartmentModel);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// ------------------ Delete Department ------------------
exports.DeleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "fail", message: "Invalid Department ID" });
    }

    // Check associations (example: Customer)
    const isAssociated = await CheckAssociateService({ DepartmentID: id }, CustomerModel);
    if (isAssociated) {
      return res.status(400).json({
        status: "fail",
        message: "This Department is associated with Customers, cannot be deleted."
      });
    }

    // Delete department
    const result = await DeleteService(req, DepartmentModel);
    if (!result) {
      return res.status(404).json({ status: "fail", message: "Department not found" });
    }

    res.status(200).json({ status: "success", message: "Department deleted successfully" });
  } catch (err) {
    console.error("DeleteDepartment error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// ------------------ Department Dropdown (with optional faculty filter) ------------------

exports.DepartmentDropdown = async (req, res) => {
  try {
    const facultyID = req.params.facultyID || null;
    let filter = {};

    if (facultyID) {
      filter.FacultyID = new mongoose.Types.ObjectId(facultyID);
    }

    const result = await DropDownService(
      req,
      DepartmentModel,
      { _id: 1, Name: 1 },
      filter   // ✅ now passed into service
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: "fail", message: err.message });
  }
};




