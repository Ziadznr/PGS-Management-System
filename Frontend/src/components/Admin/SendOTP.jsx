import React, { Fragment, useRef } from "react";
import { ErrorToast, IsEmail } from "../../helper/FormHelper";
import { RecoverVerifyEmailRequest } from "../../APIRequest/AdminAPIRequest";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/ps.png";

const SendOTP = () => {
  const emailRef = useRef(null);
  const navigate = useNavigate();

  const VerifyEmail = async () => {
    const email = emailRef.current.value.trim();

    if (!IsEmail(email)) {
      ErrorToast("Valid Email Address Required!");
      return;
    }

    try {
      const result = await RecoverVerifyEmailRequest(email);
      if (result === true) {
        navigate("/verify-otp");
      } else {
        ErrorToast("Email verification failed. Please try again.");
      }
    } catch (error) {
      ErrorToast("Something went wrong. Please try again later.");
    }
  };

  return (
    <Fragment>
  <div className="container">
    <div className="row justify-content-center">
      <div className="col-md-7 col-lg-6 center-screen">
        <div className="card login-card p-4">
          <div className="card-body text-center">

            {/* Logo */}
            <img src={logo} className="login-logo" alt="Logo" />

            {/* Title */}
            <h4 className="mb-2">Email Verification</h4>
            <p className="text-muted mb-4">
              Enter your registered email address to receive an OTP
            </p>

            {/* Email Input */}
            <input
              id="emailInput"
              ref={emailRef}
              type="email"
              className="form-control mb-4"
              placeholder="Email Address"
            />

            {/* Action Button */}
            <button
              onClick={VerifyEmail}
              className="btn login-btn w-100"
            >
              Send OTP
            </button>

          </div>
        </div>
      </div>
    </div>
  </div>
</Fragment>

  );
};

export default SendOTP;
