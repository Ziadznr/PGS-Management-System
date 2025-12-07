const UserVerifyOtpService = async (Request, DataModel) => {
    try {
        const email = Request.params.email;
        const OTPCode = Request.params.otp;

        // 1. Check OTP validity
        const otpRecord = await DataModel.findOne({
            email: email,
            otp: OTPCode,
            status: 0 // unused
        });

        if (!otpRecord) {
            return { status: 'fail', data: 'Invalid or expired OTP Code' };
        }

        // 2. Mark OTP as used
        const OTPUpdate = await DataModel.updateOne(
            { email: email, otp: OTPCode },
            { status: 1 }   // only update status field
        );

        return { status: 'success', data: OTPUpdate };

    } catch (error) {
        return { status: 'fail', data: error.toString() };
    }
};

module.exports = UserVerifyOtpService;
