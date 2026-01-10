const UpdateService=async (Request, DataModel) => {
  try {
    let PostBody = Request.body;
    let id=Request.params.id;
    let UserEmail= Request.headers['email'];
    let data = await DataModel.updateOne({_id: id, UserEmail: UserEmail}, PostBody);
    
    return { success: 'success', data: data };
  } catch (error) {
    return { status: 'fail', data: error.toString() };
  }
}

module.exports = UpdateService;