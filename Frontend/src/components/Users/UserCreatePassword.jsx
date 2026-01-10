import React, { Fragment, useRef } from "react";
import { ErrorToast, IsEmpty } from "../../helper/FormHelper";
import { UserRecoverResetPassRequest } from "../../APIRequest/UserAPIRequest";
import { getEmail, getOTP } from "../../helper/SessionHelper";
import { useNavigate } from "react-router-dom";

const UserCreatePassword = () => {

  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const navigate = useNavigate();

  const ResetPass = async () => {
    const Password = passwordRef.current.value;
    const ConfirmPassword = confirmPasswordRef.current.value;

    if (IsEmpty(Password)) {
      ErrorToast("Password Required");
      return;
    }

    if (IsEmpty(ConfirmPassword)) {
      ErrorToast("Confirm Password Required");
      return;
    }

    if (Password !== ConfirmPassword) {
      ErrorToast("Password & Confirm Password Should be Same");
      return;
    }

    const result = await UserRecoverResetPassRequest(
      getEmail(),
      getOTP(),
      Password
    );

    if (result === true) {
      navigate("/users/login"); // ✅ correct user login route
    }
  };

  return (
    <Fragment>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6 center-screen">
            <div className="card p-4">
              <div className="card-body">
                <h4>SET NEW PASSWORD</h4>
                <br />

                <label>Your email address</label>
                <input
                  readOnly
                  value={getEmail()}
                  className="form-control"
                  type="email"
                />

                <br />
                <label>New Password</label>
                <input
                  ref={passwordRef}
                  placeholder="New Password"
                  className="form-control"
                  type="password"
                />

                <br />
                <label>Confirm Password</label>
                <input
                  ref={confirmPasswordRef}
                  placeholder="Confirm Password"
                  className="form-control"
                  type="password"
                />

                <br />
                <button
                  onClick={ResetPass}
                  className="btn w-100 btn-success"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default UserCreatePassword;
