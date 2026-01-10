const mongoose = require('mongoose');

const DeleteParentChildsService = async(Request,ParentModel,ChildsModel,JoinProperty) => {

    const session = await mongoose.startSession();

    try {
        
        // Begin transaction
        await session.startTransaction();

        // Parent creation
        let DeleteID= Request.params.id;
        let UserEmail=Request.headers['email'];

        let ChildQueryObject = {};
        ChildQueryObject[JoinProperty] = DeleteID;
        ChildQueryObject['UserEmail'] = UserEmail;

        let ParentQueryObject = {};
        ParentQueryObject['_id'] = DeleteID;
        ParentQueryObject['UserEmail'] = UserEmail;

        // first process
        let ChildsDelete= await ChildsModel.remove(ChildQueryObject).session(session);

        let ParentDelete= await ParentModel.remove(ParentQueryObject).session(session);

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return {status:"success",Parent:ParentDelete,Childs:ChildsDelete};
    } catch (error) {
        // Rollback transaction in case of error
        await session.abortTransaction();
        session.endSession();
        return {status:"error",message:error.message};
    }
}

module.exports = DeleteParentChildsService;