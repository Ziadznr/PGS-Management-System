const { default: mongoose } = require("mongoose");

const CreateParentChildsService = async (Request, ParentModel, ChildsModel, JoinPropertyName) => {
    const session = await mongoose.startSession();

    try {
        await session.startTransaction();

        // Parent data creation
        let Parent = Request.body['Parent'];
        Parent.UserEmail = Request.headers['email'];

        let ParentCreation = await ParentModel.create([Parent], { session });

        if (ParentCreation && ParentCreation.length > 0) {
            const parentId = ParentCreation[0]._id;

            try {
                let Childs = Request.body['Childs'];
                Childs.forEach(element => {
                    element[JoinPropertyName] = parentId;
                    element['UserEmail'] = Request.headers['email'];
                });

                let ChildsCreation = await ChildsModel.insertMany(Childs, { session });

                await session.commitTransaction();
                session.endSession();

                return { status: 'success', data: { Parent: ParentCreation, Childs: ChildsCreation } };
            } catch (error) {
                await session.abortTransaction();
                await ParentModel.deleteOne({ _id: parentId });
                session.endSession();
                return { status: 'fail', data: 'Childs creation failed, Parent data deleted' };
            }
        } else {
            await session.abortTransaction();
            session.endSession();
            return { status: 'fail', data: 'Parent creation failed' };
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return { status: 'error', data: error.toString() };
    }
}

module.exports = CreateParentChildsService;
