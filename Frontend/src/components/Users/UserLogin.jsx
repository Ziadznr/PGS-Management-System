import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ErrorToast, IsEmail, IsEmpty } from "../../helper/FormHelper";
import { UserLoginRequest } from "../../APIRequest/UserAPIRequest";
import logo from "../../assets/images/ps.png";

const UserLogin = () => {

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

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
          <div className="card login-card p-4">
            <div className="card-body text-center">

              {/* Logo */}
              <img src={logo} className="login-logo" alt="Logo" />

              <h3>User Sign In</h3>
              <small className="text-muted d-block mb-4">
                Student / Supervisor / Chairman / Dean
              </small>

              {/* Email */}
              <input
                type="email"
                className="form-control mb-3"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />

              {/* Password */}
              <div className="position-relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>

              {/* Login Button */}
              <button
                className="btn login-btn w-100"
                onClick={SubmitLogin}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              {/* Auth Links */}
              <div className="mt-4 auth-actions">
                <Link to="/users/registration" className="btn auth-btn-outline">
                  Sign Up
                </Link>

                <Link to="/users/send-otp" className="btn auth-btn-link">
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
