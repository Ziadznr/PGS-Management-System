const ReturnProductsModel = require('../../models/Returns/ReturnsProductsModel');
const ReturnReportService = async (Request) => {
    try {
        let UserEmail = Request.headers['email'];
        let FromDate = Request.body['FromDate'];
        let ToDate = Request.body['ToDate'];

        let data = await ReturnProductsModel.aggregate([
            {$match: {UserEmail: UserEmail, CreatedDate: {$gte: new Date(FromDate), $lte: new Date(ToDate)}}},
            {
                $facet: {
                    Total: [{
                        $group: {_id: 0, TotalAmount: {$sum: "$Total"}}
                    }],
                    Rows: [{
                        $lookup: {
                            from: 'products',
                            localField: 'ProductID',
                            foreignField: '_id',
                            as: 'products'
                        }
                    }, {
                        $unwind: '$products'
                    }, {
                        $lookup: {
                            from: 'brands',
                            localField: 'products.BrandID',
                            foreignField: '_id',
                            as: 'brands'
                        }
                    }, {
                        $lookup: {
                            from: 'categories',
                            localField: 'products.CategoryID',
                            foreignField: '_id',
                            as: 'categories'
                        }
                    }]
            }}
        ])
        return {status: 'success', data: data};
    } catch (error) {
        return {status: 'error', message: error.message || 'An error occurred while generating the report.'};
    }
}

module.exports = ReturnReportService;