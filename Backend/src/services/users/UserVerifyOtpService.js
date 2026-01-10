const OTPSModel = require('../../models/Admin/OTPSModel.js');

const UserVerifyOtpService = async (emailInput, OTP) => {
    try {
        if (!emailInput || !OTP) {
            return { status: 'fail', data: 'Email and OTP are required' };
        }

        // Normalize email
        const email = emailInput.trim().toLowerCase();

        // 1️⃣ Find unused OTP
        const otpRecord = await OTPSModel.findOne({
            email: email,
            otp: OTP,
            status: 0
        });

        if (!otpRecord) {
            return { status: 'fail', data: 'Invalid or expired OTP' };
        }

        // 2️⃣ Mark OTP as used
        const updateResult = await OTPSModel.updateOne(
            { _id: otpRecord._id },
            { status: 1 }
        );

        return { status: 'success', data: updateResult };

    } catch (error) {
        return { status: 'fail', data: error.toString() };
    }
};

module.exports = UserVerifyOtpService;
