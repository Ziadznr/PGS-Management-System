import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ErrorToast, IsEmail, IsEmpty } from "../../helper/FormHelper";
import { UserLoginRequest } from "../../APIRequest/UserAPIRequest";

const UserLogin = () => {

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // ---------------- Submit Login ----------------
// UserLogin.jsx
const SubmitLogin = async () => {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!IsEmail(trimmedEmail)) {
    ErrorToast("Invalid Email Address");
    return;
  }

  if (IsEmpty(trimmedPassword)) {
    ErrorToast("Password Required");
    return;
  }

  setLoading(true);
  const result = await UserLoginRequest(trimmedEmail, trimmedPassword);
  setLoading(false);

  if (result?.success) {
    // 🔐 FORCE PASSWORD CHANGE
    if (result.isFirstLogin) {
      navigate("/users/profile");
    } else {
      navigate("/users/dashboard");
    }
  } else {
    setPassword("");
  }
};


  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6 center-screen">
          <div className="card w-90 p-4">
            <div className="card-body">
              <h3>User Sign In</h3>
              <small className="text-muted">
                Student / Supervisor / Chairman / Dean
              </small>
              <br /><br />

              <input
                type="email"
                className="form-control mb-2"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />

              <input
                type="password"
                className="form-control mb-2"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                className="btn btn-success w-100"
                onClick={SubmitLogin}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="float-end mt-3">
                <Link className="h6 me-3" to="/users/registration">
                  Sign Up
                </Link>
                |
                <Link className="h6 ms-3" to="/users/send-otp">
                  Forgot Password
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
