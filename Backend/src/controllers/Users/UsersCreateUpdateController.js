// Import services (PGS Users)
const StudentRegisterService = require('../../services/users/StudentRegisterService');
const UserLoginService = require('../../services/users/UserLoginService');
const UserUpdateService = require('../../services/users/UserUpdateService');
const UserDetailsService = require('../../services/users/UserDetailsService');
const UserVerifyEmailService = require('../../services/users/UserVerifyEmailService');
const UserVerifyOtpService = require('../../services/users/UserVerifyOtpService');
const UserResetPassService = require('../../services/users/UserResetPassService');
const SupervisorDropdownService =require("../../services/users/SupervisorDropdownService");

// ------------------ Registration ------------------
exports.StudentRegistration = async (req, res) => {
  const result = await StudentRegisterService(req);
  res.status(200).json(result);
};

// ------------------ Login ------------------
exports.Login = async (req, res) => {
    try {
        const result = await UserLoginService(req);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ status: 'fail', data: error.toString() });
    }
};

// ------------------ Profile Update ------------------
exports.ProfileUpdate = async (req, res) => {
    try {
        const result = await UserUpdateService(req);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ status: 'fail', data: error.toString() });
    }
};

// ------------------ Profile Details ------------------
exports.ProfileDetails = async (req, res) => {
    try {
        const result = await UserDetailsService(req);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ status: 'fail', data: error.toString() });
    }
};

// ------------------ Verify Email (Send OTP) ------------------
exports.RecoverVerifyEmail = async (req, res) => {
    try {
        const email = req.params.email;
        const result = await UserVerifyEmailService(email);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ status: 'fail', data: error.toString() });
    }
};

// ------------------ Verify OTP ------------------
exports.RecoverVerifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const result = await UserVerifyOtpService(email, otp);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ status: 'fail', data: error.toString() });
    }
};

// ------------------ Reset Password ------------------
exports.RecoverResetPass = async (req, res) => {
    try {
        const result = await UserResetPassService(req);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ status: 'fail', data: error.toString() });
    }
};


exports.SupervisorDropdown = async (req, res) => {
  res.status(200).json(
    await SupervisorDropdownService(req)
  );
};
