const CreateService = async (Request, DataModel) => {
  try {
    const PostBody = Request.body;
    const data = await DataModel.create(PostBody);
    return { status: "success", data };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

module.exports = CreateService;
