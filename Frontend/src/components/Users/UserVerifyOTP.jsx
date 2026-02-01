import React, { Fragment, useRef, useState } from "react";
import { ErrorToast } from "../../helper/FormHelper";
import { UserRecoverVerifyOTPRequest } from "../../APIRequest/UserAPIRequest";
import { getEmail } from "../../helper/SessionHelper";
import { useNavigate } from "react-router-dom";

const UserVerifyOTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputsRef.current[5].focus();
    }
  };

  const SubmitOTP = async () => {
    const OTP = otp.join("");

    if (OTP.length !== 6) {
      ErrorToast("Enter 6 Digit Code");
      return;
    }

    const result = await UserRecoverVerifyOTPRequest(getEmail(), OTP);
    if (result === true) {
      navigate("/users/create-password");
    }
  };

  return (
    <Fragment>
      <div className="container">
        <div className="row d-flex justify-content-center">
          <div className="col-md-7 col-lg-6 center-screen">
            <div className="card w-90 p-4">
              <div className="card-body text-center">
                <h4>OTP VERIFICATION</h4>
                <p>
                  A 6 Digit verification code has been sent to your email address.
                </p>

                <div
                  className="d-flex justify-content-center gap-2"
                  onPaste={handlePaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputsRef.current[index] = el)}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) =>
                        handleChange(index, e.target.value)
                      }
                      className="text-center"
                      style={{
                        width: "45px",
                        height: "45px",
                        fontSize: "28px",
                        borderRadius: "4px",
                        border: "1px solid lightgrey",
                      }}
                    />
                  ))}
                </div>

                <br />

                <button
                  onClick={SubmitOTP}
                  className="btn w-100 btn-success"
                  disabled={otp.join("").length !== 6}
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

export default UserVerifyOTP;
