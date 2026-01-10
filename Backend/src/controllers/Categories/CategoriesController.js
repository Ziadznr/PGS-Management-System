const DataModel = require('../../models/Categories/CategoriesModel');
const CreateService = require('../../services/common/CreateService');
const UpdateService = require('../../services/common/UpdateService');
const ListService = require('../../services/common/ListService');
const DropDownService = require('../../services/common/DropDownService');
const mongoose = require('mongoose');
const DeleteService = require('../../services/common/DeleteService');
const CheckAssociationService = require('../../services/common/CheckAssociateService');
const ProductsModel = require('../../models/Products/ProductsModel');
const DetailsByIDService = require('../../services/common/DetailsByIDService');

exports.CreateCategories = async (req, res) => {
    let Result=await CreateService(req,DataModel)
    res.status(200).json(Result);
}

exports.UpdateCategories = async (req, res) => {
    let Result=await UpdateService(req,DataModel)
    res.status(200).json(Result);
}

exports.CategoriesList = async (req, res) => {
    let SearchRgx={'$regex':req.params.searchKeyword, '$options':'i'};
    let SearchArray = [
        { Name: SearchRgx }]  
    let Result=await ListService(req,DataModel,SearchArray)
    res.status(200).json(Result);
}   

exports.CategoriesDropdown = async (req, res) => {
    let Result=await DropDownService(req,DataModel,{_id:1, Name:1})
    res.status(200).json(Result);
}

exports.CategoriesDetailsByID=async(req,res)=>{
  let Result=await DetailsByIDService(req,DataModel)
  res.status(200).json(Result);
}

exports.DeleteCategories = async (req, res) => {
  let DeleteID = req.params.id;
  let ObjectId=mongoose.Types.ObjectId;
  let CheckAssociate = await CheckAssociationService({CategoryID:new ObjectId(DeleteID)}, ProductsModel);
  if (CheckAssociate) {
    return res.status(400).json({ message: "This Category is associated with Products, cannot be deleted." });
  }else {
    const Result = await DeleteService(req, DataModel);
    res.status(200).json(Result);
  }
}