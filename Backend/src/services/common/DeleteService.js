const DeleteService=async(Request, Model) => {
    try {
        let DeleteID = Request.params.id;
        let UserEmail = Request.headers['email'];

        let QueryObject={};
        QueryObject['_id'] = DeleteID;
        QueryObject['UserEmail'] = UserEmail;

        let Delete = await Model.deleteOne(QueryObject);

        return {status: 'success', data: Delete};
    } catch (error) {
        return {status: 'error', data: error.toString()};
        
    }
}

module.exports = DeleteService;