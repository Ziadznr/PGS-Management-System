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

// CREATE
exports.CreateDepartment = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ status: "fail", message: "Name required" });
  }
  const result = await CreateService(req, DepartmentModel);
  res.status(200).json(result);
};

// UPDATE
exports.UpdateDepartment = async (req, res) => {
  const result = await UpdateService(req, DepartmentModel);
  res.status(200).json(result);
};

// LIST
exports.ListDepartments = async (req, res) => {
  const SearchArray = [
    { name: { $regex: req.params.searchKeyword === "0" ? "" : req.params.searchKeyword, $options: "i" } }
  ];
  const result = await ListService(req, DepartmentModel, SearchArray);
  res.status(200).json(result);
};

// DETAILS
exports.DepartmentDetailsByID = async (req, res) => {
  const result = await DetailsByIDService(req, DepartmentModel);
  res.status(200).json(result);
};

// DELETE
exports.DeleteDepartment = async (req, res) => {
  const check = await CheckAssociateService(
    { department: req.params.id },
    UsersModel
  );

  if (check.status !== "success") {
    return res.status(400).json(check);
  }

  const result = await DeleteService(req, DepartmentModel);
  res.status(200).json(result);
};

// DROPDOWN
exports.DepartmentDropdown = async (req, res) => {
  const result = await DropDownService(req, DepartmentModel, { _id: 1, name: 1 });
  res.status(200).json(result);
};
