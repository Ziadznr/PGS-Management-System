const ListOneJoinService = async (Request, DataModel, SearchArray, JoinStage) => {
    try {
        const pageNo = Math.max(Number(Request.params.pageNo) || 1, 1);
        const perPage = Math.max(Number(Request.params.perPage) || 10, 1);
        const searchValue = Request.params.searchKeyword || "0";
        const skipRow = (pageNo - 1) * perPage;

        const UserEmail = Request.headers['email']; // consistent with other services
        const matchStage = UserEmail ? { UserEmail } : {};

        const aggregatePipeline = [
            { $match: matchStage },
            JoinStage
        ];

        if (searchValue !== "0" && SearchArray?.length > 0) {
            aggregatePipeline.push({ $match: { $or: SearchArray } });
        }

        aggregatePipeline.push({
            $facet: {
                Total: [{ $count: "count" }],
                Rows: [{ $skip: skipRow }, { $limit: perPage }]
            }
        });

        const data = await DataModel.aggregate(aggregatePipeline);

        return { status: "success", data };
    } catch (error) {
        return { status: "error", data: error.toString() };
    }
};

module.exports = ListOneJoinService;
