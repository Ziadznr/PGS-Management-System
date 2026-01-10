const ExpensesModel = require('../../models/Expenses/ExpensesModel');
const ExpenseSummeryService=async(Request)=>{
    try {
        let UserEmail=Request.headers['email'];

        let data= await ExpensesModel.aggregate([
            {$match:{UserEmail:UserEmail}},
            {
                $facet:{
                    Total:[{
                        $group:{_id:0,TotalAmount:{$sum:"$Amount"}}
                    }],
                    Last30Days:[{
                        $group:{_id:{$dateToString:{format:"%Y-%m-%d",date:"$CreatedDate"}},TotalAmount:{$sum:"$Amount"}},
                        
                    },
                    {
                        $sort:{"_id":-1}
                    },
                    {
                        $limit:30
                    }]
                }
            }
        ]);
        return {status:'success', data:data};
    } catch (error) {
        return {status:'error', message:error.message || 'An error occurred while generating the summary.'};
    }
}

module.exports = ExpenseSummeryService;