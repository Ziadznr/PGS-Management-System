const FacultyModel = require('../../models/Faculties/FacultyModel');
const CreateService = require('../../services/common/CreateService');
const ListService = require('../../services/common/ListService');
const DeleteService = require('../../services/common/DeleteService');
const DropDownService = require('../../services/common/DropDownService');
const CheckAssociateService = require('../../services/common/CheckAssociateService');

// Create Faculty
exports.CreateFaculty = async (req, res) => {
    let result = await CreateService(req, FacultyModel);
    res.status(200).json(result);
};

// List Faculties (with search & pagination)
exports.ListFaculties = async (req, res) => {
    let SearchArray = [{ Name: { $regex: req.params.searchKeyword, $options: 'i' } }];
    let result = await ListService(req, FacultyModel, SearchArray);
    res.status(200).json(result);
};

// Delete Faculty
exports.DeleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if any Department exists under this Faculty
        let check = await CheckAssociateService(id, DepartmentModel, 'FacultyID');
        if (check.status !== "success") {
            return res.status(400).json(check);
        }

        let result = await DeleteService(req, FacultyModel);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// Faculty Dropdown (works for both admin & self-registration)
exports.FacultyDropdown = async (req, res) => {
  const projection = { _id: 1, Name: 1 };
  let result = await DropDownService(req, FacultyModel, projection);
  res.status(200).json(result);
};


