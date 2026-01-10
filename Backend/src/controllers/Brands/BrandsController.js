const DataModel = require('../../models/Brands/BrandsModel');
const CreateService = require('../../services/common/CreateService');
const UpdateService = require('../../services/common/UpdateService');
const DropDownService = require('../../services/common/DropDownService');
const ListService = require('../../services/common/ListService');
const mongoose = require('mongoose');
const DeleteService = require('../../services/common/DeleteService');
const CheckAssociationService = require('../../services/common/CheckAssociateService');
const ProductsModel = require('../../models/Products/ProductsModel');
const DetailsByIDService = require('../../services/common/DetailsByIDService');

exports.CreateBrand = async (req, res) => {
  const Result = await CreateService(req, DataModel);
  res.status(200).json(Result);
}

exports.UpdateBrand = async (req, res) => {
  const Result = await UpdateService(req, DataModel);
  res.status(200).json(Result);
}

exports.BrandList = async (req, res) => {
  const SearchRgx={'$regex':req.params.searchKeyword, '$options':'i'};
  const SearchArray = [{ Name: SearchRgx }];
  const Result = await ListService(req, DataModel, SearchArray);
  res.status(200).json(Result);
}

exports.BrandDetailsByID=async(req,res)=>{
  let Result=await DetailsByIDService(req,DataModel)
  res.status(200).json(Result);
}

exports.BrandDropDown = async (req, res) => {
  const Projection = { _id: 1, Name: 1 };
  const Result = await DropDownService(req, DataModel, Projection);
  res.status(200).json(Result);
}

exports.DeleteBrand = async (req, res) => {
  const DeleteID = req.params.id;
  const ObjectId = mongoose.Types.ObjectId;
  const CheckAssociate = await CheckAssociationService({ BrandID: new ObjectId(DeleteID) }, ProductsModel);

  if (CheckAssociate) {
    return res.status(400).json({ message: "This Brand is associated with Products, cannot be deleted." });
  } else {
    const Result = await DeleteService(req, DataModel);
    res.status(200).json(Result);
  }
};
