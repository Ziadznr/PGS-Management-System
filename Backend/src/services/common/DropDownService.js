const DropDownService = async (Request, DataModel, Projection) => {
  try {
    const UserEmail = Request.headers['email'];
    const match = UserEmail ? { UserEmail } : {}; // if no email, match all

    const data = await DataModel.aggregate([
      { $match: match },
      { $project: Projection }
    ]);

    return { status: 'success', data };
  } catch (error) {
    console.error("DropDownService error:", error);
    return { status: 'fail', data: error.toString() };
  }
};

module.exports = DropDownService;
