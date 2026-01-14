const FacultyModel = require("../../models/Faculties/FacultyModel");

const FacultyDropdownService = async () => {
    try {
        const data = await FacultyModel.find(
            {},
            { _id: 1, name: 1 }
        ).lean();

        return { status: "success", data };
    } catch (error) {
        return { status: "fail", data: error.message };
    }
};

module.exports = FacultyDropdownService;
