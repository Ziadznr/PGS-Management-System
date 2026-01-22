const DropDownService = async (Request, DataModel, Projection) => {
  try {
    const data = await DataModel.find(
      { isActive: true },
      Projection
    );
    return { status: "success", data };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

module.exports = DropDownService;
