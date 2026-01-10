const ListTwoJoinService = async (Request, DataModel, SearchArray, JoinStage1, JoinStage2) => {
    try {
        const pageNo = Number(Request.params.pageNo);
        const perPage = Number(Request.params.perPage);
        const searchValue = Request.params.searchKeyword;
        const UserEmail = Request.headers['email'];
        const skipRow = (pageNo - 1) * perPage;

        let aggregationPipeline = [
            { $match: { UserEmail } },
            JoinStage1,
            JoinStage2,
            {
                $lookup: {
                    from: 'purchasesproducts',
                    localField: '_id',
                    foreignField: 'ProductID',
                    as: 'purchases'
                }
            },
            {
                $lookup: {
                    from: 'salesproducts',
                    localField: '_id',
                    foreignField: 'ProductID',
                    as: 'sales'
                }
            },
            {
                $addFields: {
                    Stock: {
                        $subtract: [
                            { $sum: "$purchases.Qty" },
                            { $sum: "$sales.Qty" }
                        ]
                    }
                }
            }
        ];

        // Apply search if searchValue is not '0'
        if (searchValue !== '0') {
            aggregationPipeline.push({ $match: { $or: SearchArray } });
        }

        // Add pagination
        aggregationPipeline.push({
            $facet: {
                Total: [{ $count: "count" }],
                Rows: [{ $skip: skipRow }, { $limit: perPage }]
            }
        });

        const data = await DataModel.aggregate(aggregationPipeline);
        return { status: 'success', data };
    } catch (error) {
        return { status: 'error', data: error.toString() };
    }
};

module.exports = ListTwoJoinService;
