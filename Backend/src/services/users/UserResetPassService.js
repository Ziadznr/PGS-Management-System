const bcrypt = require('bcryptjs');
const OTPSModel = require('../../models/Admin/OTPSModel.js');
const UsersModel = require('../../models/Users/UsersModel.js');

const UserResetPassService = async (Request) => {
    try {
        const { email, OTP, password } = Request.body;

        // 1️⃣ Validate input
        if (!email || !OTP || !password) {
            return { status: 'fail', data: 'Missing required fields' };
        }

        // 2️⃣ Check OTP (unused + valid)
        const otpRecord = await OTPSModel.findOne({
            email: email,
            otp: OTP,
            status: 0
        });

        if (!otpRecord) {
            return { status: 'fail', data: 'Invalid or expired OTP' };
        }

        // 3️⃣ Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4️⃣ Update user password
        await UsersModel.updateOne(
            { email: email },
            { password: hashedPassword }
        );

        // 5️⃣ Mark OTP as used
        await OTPSModel.updateOne(
            { email: email, otp: OTP },
            { status: 1 }
        );

        return { status: 'success', data: 'Password updated successfully' };

    } catch (error) {
        return { status: 'fail', data: error.toString() };
    }
};

module.exports = UserResetPassService;
