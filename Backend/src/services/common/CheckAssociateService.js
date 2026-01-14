const CheckAssociateService = async (QueryObject, AssociateModel) => {
  try {
    const count = await AssociateModel.countDocuments(QueryObject);
    return count === 0
      ? { status: "success" }
      : { status: "fail", message: "Associated data exists" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

module.exports = CheckAssociateService;
