const ListService = async (Request, DataModel, SearchArray) => {
  try {
    const pageNo = Number(Request.params.pageNo);
    const perPage = Number(Request.params.perPage);
    const searchValue = Request.params.searchKeyword;

    const skipRow = (pageNo - 1) * perPage;

    let pipeline = [];

    if (searchValue !== "0") {
      pipeline.push({ $match: { $or: SearchArray } });
    }

    pipeline.push({
      $facet: {
        Total: [{ $count: "count" }],
        Rows: [{ $skip: skipRow }, { $limit: perPage }]
      }
    });

    const data = await DataModel.aggregate(pipeline);
    return { status: "success", data };

  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

module.exports = ListService;
