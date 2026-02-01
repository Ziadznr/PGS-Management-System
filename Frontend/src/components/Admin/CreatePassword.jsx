import React, { Fragment, useRef } from "react";
import { ErrorToast, IsEmpty } from "../../helper/FormHelper";
import { RecoverResetPassRequest } from "../../APIRequest/AdminAPIRequest";
import { getEmail, getOTP } from "../../helper/SessionHelper";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/ps.png";

const CreatePassword = () => {

    const passwordRef = useRef();
    const confirmPasswordRef = useRef();
    const navigate = useNavigate();

    const ResetPass = async () => {
        const Password = passwordRef.current.value;
        const ConfirmPassword = confirmPasswordRef.current.value;

        if (IsEmpty(Password)) {
            ErrorToast("Password Required");
        }
        else if (IsEmpty(ConfirmPassword)) {
            ErrorToast("Confirm Password Required");
        }
        else if (Password !== ConfirmPassword) {
            ErrorToast("Password & Confirm Password Should be Same");
        }
        else {
            const result = await RecoverResetPassRequest(
                getEmail(),
                getOTP(),
                Password
            );

            if (result === true) {
                navigate("/login"); // ✅ correct for admin
            }
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
            <h4 className="mb-2">Set New Password</h4>
            <p className="text-muted mb-4">
              Please create a new secure password
            </p>

            {/* Email (readonly) */}
            <input
              readOnly
              value={getEmail()}
              className="form-control mb-3"
              type="email"
            />

            {/* New Password */}
            <input
              ref={passwordRef}
              placeholder="New Password"
              className="form-control mb-3"
              type="password"
            />

            {/* Confirm Password */}
            <input
              ref={confirmPasswordRef}
              placeholder="Confirm Password"
              className="form-control mb-4"
              type="password"
            />

            {/* Action Button */}
            <button
              onClick={ResetPass}
              className="btn login-btn w-100"
            >
              Update Password
            </button>

          </div>
        </div>
      </div>
    </div>
  </div>
</Fragment>

    );
};

export default CreatePassword;
