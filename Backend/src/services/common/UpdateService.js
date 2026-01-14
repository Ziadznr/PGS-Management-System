const UpdateService = async (Request, DataModel) => {
  try {
    const id = Request.params.id;
    const PostBody = Request.body;

    const data = await DataModel.updateOne(
      { _id: id },
      { $set: PostBody }
    );

    return { status: "success", data };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

module.exports = UpdateService;
