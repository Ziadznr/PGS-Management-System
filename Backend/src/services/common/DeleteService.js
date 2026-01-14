const DeleteService = async (Request, Model) => {
  try {
    const id = Request.params.id;
    const data = await Model.deleteOne({ _id: id });
    return { status: "success", data };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

module.exports = DeleteService;
