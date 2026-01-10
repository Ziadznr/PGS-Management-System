const DataModel = require('../../models/Expenses/ExpenseTypesModel');
const CreateService = require('../../services/common/CreateService');
const UpdateService = require('../../services/common/UpdateService');
const ListService = require('../../services/common/ListService');
const DropDownService = require('../../services/common/DropDownService');
const ExpensesModel = require('../../models/Expenses/ExpensesModel');
const mongoose = require('mongoose');
const DeleteService = require('../../services/common/DeleteService');
const CheckAssociationService = require('../../services/common/CheckAssociateService');
const DetailsByIDService = require('../../services/common/DetailsByIDService');

exports.CreateExpenseTypes = async (req, res) => {
    let Result=await CreateService(req,DataModel)
    res.status(200).json(Result);
}

exports.UpdateExpenseTypes = async (req, res) => {
    let Result=await UpdateService(req,DataModel)
    res.status(200).json(Result);
}

exports.ExpenseTypesList = async (req, res) => {
    let SearchRgx={'$regex':req.params.searchKeyword, '$options':'i'};
    let SearchArray = [{Name: SearchRgx}];  
    let Result=await ListService(req,DataModel,SearchArray)
    res.status(200).json(Result);
}   

exports.ExpenseTypesDropdown = async (req, res) => {
    let Result=await DropDownService(req,DataModel,{_id:1, Name:1})
    res.status(200).json(Result);
}

exports.ExpenseTypesDetailsByID=async(req,res)=>{
  let Result=await DetailsByIDService(req,DataModel)
  res.status(200).json(Result);
}

exports.DeleteExpenseType = async (req, res) => {
    let DeleteID = req.params.id;
  let ObjectId=mongoose.Types.ObjectId;
  let CheckAssociate = await CheckAssociationService({TypeID:new ObjectId(DeleteID)}, ExpensesModel);
  if (CheckAssociate) {
    return res.status(400).json({ message: "This Brand is associated with Products, cannot be deleted." });
  }else {
    const Result = await DeleteService(req, DataModel);
    res.status(200).json(Result);
  }
}