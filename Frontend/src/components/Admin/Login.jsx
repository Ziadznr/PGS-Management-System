import React, { Fragment, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorToast, IsEmail, IsEmpty } from "../../helper/FormHelper";
import { LoginRequest } from "../../APIRequest/AdminAPIRequest";
import logo from "../../assets/images/ps.png";

const Login = () => {
    const emailRef = useRef();
    const passRef = useRef();
    const [showPassword, setShowPassword] = useState(false);

    const SubmitLogin = async () => {
        const email = emailRef.current.value;
        const pass = passRef.current.value;

        if (!IsEmail(email)) {
            ErrorToast("Invalid Email Address");
        } else if (IsEmpty(pass)) {
            ErrorToast("Password Required");
        } else {
            let result = await LoginRequest(email, pass);
            if (result) {
                window.location.href = "/";
            }
        }
    };

    return (
        <Fragment>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-7 col-lg-5 center-screen">
                        <div className="card login-card p-4">
                            <div className="card-body text-center">

                                {/* Logo */}
                                <img src={logo} className="login-logo" alt="Logo" />

                                <h3 className="mb-4">SIGN IN</h3>

                                {/* Email */}
                                <input
                                    ref={emailRef}
                                    type="email"
                                    className="form-control mb-3"
                                    placeholder="User Email"
                                />

                                {/* Password */}
                                <div className="position-relative mb-4">
                                    <input
                                        ref={passRef}
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="User Password"
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
                                    onClick={SubmitLogin}
                                    className="btn login-btn w-100"
                                >
                                    Login
                                </button>

                                {/* Auth Actions */}
                                <div className="mt-4 auth-actions">
                                    <Link to="/Registration" className="btn auth-btn-outline">
                                        Sign Up
                                    </Link>

                                    <Link to="/send-otp" className="btn auth-btn-link">
                                        Forget Password?
                                    </Link>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Login;
