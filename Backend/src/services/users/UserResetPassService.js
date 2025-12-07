const bcrypt = require('bcrypt');
const OTPSModel = require('../../models/Users/OTPSModel.js');

const UserResetPassService = async (Request, DataModel) => {
    try {
        const { email, OTP, password } = Request.body;

        // 1. Validate input
        if (!email || !OTP || !password) {
            return { status: 'fail', data: 'Missing required fields' };
        }

        // 2. Check OTP validity and expiry
        const otpRecord = await OTPSModel.findOne({
            email: email,
            otp: OTP,
            status: 0 // unused OTP
        });

        if (!otpRecord) {
            return { status: 'fail', data: "Invalid or expired OTP" };
        }

        // 3. Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        // 4. Update password
        const passUpdate = await DataModel.updateOne(
            { email: email },
            { password: hashedPass }
        );

        // 5. Mark OTP as used
        await OTPSModel.updateOne(
            { email: email, otp: OTP },
            { status: 1 }     // 1 = used
        );

        return { status: 'success', data: passUpdate };

    } catch (error) {
        return { status: 'fail', data: error.toString() };
    }
};

module.exports = UserResetPassService;
