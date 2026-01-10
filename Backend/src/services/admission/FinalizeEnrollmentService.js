const UsersModel = require("../../models/Users/UsersModel");
const StudentEnrollmentModel = require("../../models/Students/StudentEnrollmentModel");
const FacultyRegistrationRangeModel = require("../../models/Admission/FacultyRegistrationRangeModel");
const TemporaryAccessModel = require("../../models/Admission/TemporaryAccessModel");

const FinalizeEnrollmentService = async (req) => {
    try {
        const {
            applicationId,
            admissionSeason,
            faculty,
            department,
            email,
            password
        } = req.body;

        const range = await FacultyRegistrationRangeModel.findOne({
            admissionSeason,
            faculty
        });

        if (!range || range.currentRegNo > range.endRegNo) {
            return { status: "fail", data: "Registration range exhausted" };
        }

        const registrationNumber = range.currentRegNo;
        range.currentRegNo += 1;
        await range.save();

        const user = await UsersModel.create({
            email,
            password,
            role: "Student"
        });

        const enrollment = await StudentEnrollmentModel.create({
            application: applicationId,
            user: user._id,
            admissionSeason,
            faculty,
            department,
            registrationNumber,
            studentId: `PGS-${registrationNumber}`,
            enrollmentStatus: "Completed",
            enrolledAt: new Date()
        });

        await TemporaryAccessModel.updateOne(
            { application: applicationId },
            { isUsed: true }
        );

        return { status: "success", data: enrollment };
    } catch (error) {
        return { status: "fail", data: error.message };
    }
};

module.exports = FinalizeEnrollmentService;
