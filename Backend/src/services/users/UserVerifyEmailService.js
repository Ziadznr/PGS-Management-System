const OTPSModel = require('../../models/Users/OTPSModel.js');
const SendEmailUtility = require('../../utility/SendEmailUtility');

const UserVerifyEmailService = async (Request, DataModel) => {
    try {
        const email = Request.params.email;

        // 1. Check if user exists
        const user = await DataModel.findOne({ email: email });
        if (!user) {
            return { status: 'fail', data: 'No user found' };
        }

        // 2. Generate 6-digit OTP
        const OTPCode = Math.floor(100000 + Math.random() * 900000);

        // 3. Optional (Delete old OTPs for this email)
        await OTPSModel.deleteMany({ email: email });

        // 4. Save new OTP with status + expiry
        await OTPSModel.create({
            email: email,
            otp: OTPCode,
            status: 0,              // unused
            createdAt: Date.now()   // needed for auto-expiry index
        });

        // 5. Send OTP Email
        const subject = "Your Verification Code";
        const body = `Your OTP code is: ${OTPCode}. It will expire in 5 minutes.`;

        const sendEmail = await SendEmailUtility(email, body, subject);

        return { status: "success", data: sendEmail };

    } catch (error) {
        return { status: "fail", data: error.toString() };
    }
};

module.exports = UserVerifyEmailService;
