const PurchasesModel = require('../../models/Purchases/PurchasesModel');

const PurchaseSummeryService = async (Request) => {
    try {
        let UserEmail = Request.headers['email'];

        let data = await PurchasesModel.aggregate([
            { $match: { UserEmail: UserEmail } },
            {
                $facet: {
                    Total: [
                        { $group: { _id: 0, TotalAmount: { $sum: "$GrandTotal" } } }
                    ],
                    Last30Days: [
                        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$CreatedDate" } }, TotalAmount: { $sum: "$GrandTotal" } } },
                        { $sort: { "_id": -1 } },
                        { $limit: 30 }
                    ]
                }
            }
        ]);

        return { status: 'success', data: data };
    } catch (error) {
        return { status: 'error', message: error.message || 'An error occurred while generating the summary.' };
    }
}

module.exports = PurchaseSummeryService;
