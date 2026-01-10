const DataModel=require("../../models/Products/ProductsModel")
const CreateService = require('../../services/common/CreateService');
const UpdateService = require('../../services/common/UpdateService');
const ListTwoJoinService = require('../../services/common/ListTwoJoinService');
const DeleteService = require('../../services/common/DeleteService');
const CheckAssociationService = require('../../services/common/CheckAssociateService');
const ReturnProductsModel = require('../../models/Returns/ReturnsProductsModel');
const SalesProductsModel = require('../../models/Sales/SalesProductsModel');
const PurchasesProductsModel = require('../../models/Purchases/PurchasesProductsModel');
const mongoose = require('mongoose');
const DetailsByIDService = require("../../services/common/DetailsByIDService");
const ProductsDropDown =require('../../services/Products/ProductsDropDown')

exports.CreateProduct = async (req, res) => {
    let Result=await CreateService(req,DataModel)
    res.status(200).json(Result);
}

exports.UpdateProduct = async (req, res) => {
    let Result=await UpdateService(req,DataModel)
    res.status(200).json(Result);
}

exports.ProductsList = async (req, res) => {
    try {
        let pageNo = Number(req.params.pageNo);
        let perPage = Number(req.params.perPage);
        let searchValue = req.params.searchKeyword;
        let skipRow = (pageNo - 1) * perPage;
        let UserEmail = req.headers['email'];

        let SearchRgx = { '$regex': searchValue, '$options': 'i' };
        let SearchArray = [
            { Name: SearchRgx },
            { Details: SearchRgx },
            { 'brands.Name': SearchRgx },
            { 'categories.Name': SearchRgx }
        ];

        let aggregatePipeline = [
            // { $match: { UserEmail } },

            // Join with brands and categories
            {
                $lookup: {
                    from: 'brands',
                    localField: 'BrandID',
                    foreignField: '_id',
                    as: 'brands'
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'CategoryID',
                    foreignField: '_id',
                    as: 'categories'
                }
            },

            // Join with purchasesproducts to calculate purchased quantity
            {
                $lookup: {
                    from: 'purchasesproducts',
                    localField: '_id',
                    foreignField: 'ProductID',
                    as: 'purchases'
                }
            },

            // Join with salesproducts to calculate sold quantity
            {
                $lookup: {
                    from: 'salesproducts',
                    localField: '_id',
                    foreignField: 'ProductID',
                    as: 'sales'
                }
            },

            // Calculate stock: Purchased - Sold
            {
                $addFields: {
                    TotalPurchased: { $sum: "$purchases.Qty" },
                    TotalSold: { $sum: "$sales.Qty" },
                    Stock: { $subtract: [ { $sum: "$purchases.Qty" }, { $sum: "$sales.Qty" } ] }
                }
            }
        ];

        // Apply search filter if not '0'
        if (searchValue !== '0') {
            aggregatePipeline.push({ $match: { $or: SearchArray } });
        }

        // Pagination
        aggregatePipeline.push({
            $facet: {
                Total: [{ $count: "count" }],
                Rows: [{ $skip: skipRow }, { $limit: perPage }]
            }
        });

        let data = await DataModel.aggregate(aggregatePipeline);
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', data: error.toString() });
    }
};



exports.ProductDetailsByID=async(req,res)=>{
  let Result=await DetailsByIDService(req,DataModel)
  res.status(200).json(Result);
}

exports.DeleteProduct = async (req, res) => {
  let DeleteID = req.params.id;
  let ObjectId=mongoose.Types.ObjectId;

  let CheckReturnAssociate = await CheckAssociationService({ProductID:new ObjectId(DeleteID)}, ReturnProductsModel);
  let CheckSaleAssociate = await CheckAssociationService({ProductID:new ObjectId(DeleteID)}, SalesProductsModel);
  let CheckPurchaseAssociate = await CheckAssociationService({ProductID:new ObjectId(DeleteID)}, PurchasesProductsModel);

  if (CheckReturnAssociate) {
    return res.status(400).json({ message: "This Product is associated with Return Products, cannot be deleted." });
  }
  else if (CheckSaleAssociate) {
    return res.status(400).json({ message: "This Product is associated with Sales Products, cannot be deleted." });
  }
  else if (CheckPurchaseAssociate) {
    return res.status(400).json({ message: "This Product is associated with Purchase Products, cannot be deleted." });
  }

  else {
    const Result = await DeleteService(req, DataModel);
    res.status(200).json(Result);
  }
}

exports.ProductsDropDown = async (req, res) => {
  try {
    const userEmail = req.headers['email'];
    const result = await ProductsDropDown(userEmail);
    console.log("ProductsDropDown result:", result);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    console.error("ProductsDropDown Error:", error);
    res.status(500).json({ status: 'fail', data: error.toString() });
  }
};