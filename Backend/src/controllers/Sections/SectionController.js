const SectionModel = require('../../models/Sections/SectionModel');
const CreateService = require('../../services/common/CreateService');
const ListService = require('../../services/common/ListService');
const DeleteService = require('../../services/common/DeleteService');
const DropDownService = require('../../services/common/DropDownService');
const CheckAssociateService = require('../../services/common/CheckAssociateService');
const CustomerModel=require('../../models/Users/UsersModel')

// Create Section
exports.CreateSection = async (req, res) => {
    let result = await CreateService(req, SectionModel);
    res.status(200).json(result);
};

// List Sections (with search & pagination)
exports.ListSections = async (req, res) => {
    let SearchArray = [{ Name: { $regex: req.params.searchKeyword, $options: 'i' } }];
    let result = await ListService(req, SectionModel, SearchArray);
    res.status(200).json(result);
};

// Delete Section
exports.DeleteSection = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if any Customer exists under this Section
        let check = await CheckAssociateService(id, CustomerModel, 'FacultyID');
        if (check.status !== "success") {
            return res.status(400).json(check);
        }

        let result = await DeleteService(req, SectionModel);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

exports.SectionDropdown = async (req, res) => {
  const projection = { _id: 1, Name: 1 };
  const result = await DropDownService(req, SectionModel, projection);
  res.status(200).json(result);
};


