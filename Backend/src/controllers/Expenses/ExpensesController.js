const DataModel=require("../../models/Expenses/ExpensesModel")
const CreateService = require('../../services/common/CreateService');
const UpdateService = require('../../services/common/UpdateService');   
const ListOneJoinService = require('../../services/common/ListOneJoinService');
const DeleteService = require('../../services/common/DeleteService');
const ExpenseReportService = require('../../services/report/ExpenseReportService');
const ExpenseSummeryService = require('../../services/summery/ExpenseSummeryService');
const DetailsByIDService = require("../../services/common/DetailsByIDService");

exports.CreateExpense = async (req, res) => {
    let Result=await CreateService(req,DataModel)
    res.status(200).json(Result);
}

exports.UpdateExpense = async (req, res) => {
    let Result=await UpdateService(req,DataModel)
    res.status(200).json(Result);
}

exports.ExpensesList = async (req, res) => {
    let SearchRgx={"$regex":req.params.searchKeyword, "$options":"i"};
    let SearchArray=[{Note:SearchRgx},{Amount:SearchRgx},{'Type.Name':SearchRgx}];
    let JoinStage={
        $lookup: {
            from: "expensetypes",
            localField: "TypeID",
            foreignField: "_id",
            as: "Type"
        }
    };
    let Result=await ListOneJoinService(req,DataModel,SearchArray,JoinStage)
    res.status(200).json(Result);
}

exports.ExpensesDetailsByID=async(req,res)=>{
  let Result=await DetailsByIDService(req,DataModel)
  res.status(200).json(Result);
}

exports.DeleteExpenses = async (req, res) => {
    let Result = await DeleteService(req, DataModel);
    res.status(200).json(Result);
}

exports.ExpenseByDate = async (req, res) => {
    let Result = await ExpenseReportService(req);
    res.status(200).json(Result);
}

exports.ExpensesSummery= async (req, res) => {
    let Result = await ExpenseSummeryService(req);
    res.status(200).json(Result);
}


