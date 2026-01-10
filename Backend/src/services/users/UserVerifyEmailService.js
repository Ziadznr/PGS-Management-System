const OTPSModel = require('../../models/Admin/OTPSModel.js');
const SendEmailUtility = require('../../utility/SendEmailUtility.js');
const UsersModel = require('../../models/Users/UsersModel.js');

const UserVerifyEmailService = async (emailInput) => {
    try {
        if (!emailInput) {
            return { status: 'fail', data: 'Email is required' };
        }

        // Normalize email
        const email = emailInput.trim().toLowerCase();

        // 1️⃣ Check user exists
        const user = await UsersModel.findOne({ email: email });
        if (!user) {
            return { status: 'fail', data: 'User not found' };
        }

        // 2️⃣ Generate 6-digit OTP
        const OTPCode = Math.floor(100000 + Math.random() * 900000);

        // 3️⃣ Remove previous OTPs for this email
        await OTPSModel.deleteMany({ email: email });

        // 4️⃣ Save new OTP (status = unused)
        await OTPSModel.create({
            email: email,
            otp: OTPCode,
            status: 0
        });

        // 5️⃣ Send email
        await SendEmailUtility(
            email,
            `Your verification code is ${OTPCode}. This code will expire in 5 minutes.`,
            "PGS Account Verification"
        );

        return { status: "success", data: "OTP sent successfully" };

    } catch (error) {
        return { status: 'fail', data: error.toString() };
    }
};

module.exports = UserVerifyEmailService;
