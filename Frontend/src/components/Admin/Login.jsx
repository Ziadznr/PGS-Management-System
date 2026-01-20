import React, { Fragment, useRef } from 'react';
import { Link } from "react-router-dom";
import { ErrorToast, IsEmail, IsEmpty } from "../../helper/FormHelper";
import { LoginRequest } from "../../APIRequest/AdminAPIRequest";

const Login = () => {
    // Correctly create refs for email and password inputs
    const emailRef = useRef();
    const passRef = useRef();

    const SubmitLogin = async () => {
        // Access values from refs
        const email = emailRef.current.value;
        const pass = passRef.current.value;

        // Validate email and password
        if (!IsEmail(email)) {
            ErrorToast("Invalid Email Address");
        } else if (IsEmpty(pass)) {
            ErrorToast("Password Required");
        } else {
            let result = await LoginRequest(email, pass);
            if (result) {
                // Redirect on successful login
                window.location.href = "/";
            }
        }
    };

    return (
        <Fragment>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-7 col-lg-6 center-screen">
                        <div className="card w-90 p-4">
                            <div className="card-body">
                                <h3>SIGN IN</h3>
                                <br />
                                <input
                                    ref={emailRef}
                                    placeholder="User Email"
                                    className="form-control"
                                    type="email"
                                />
                                <br />
                                <input
                                    ref={passRef}
                                    placeholder="User Password"
                                    className="form-control"
                                    type="password"
                                />
                                <br />
                                <button
                                    onClick={SubmitLogin}
                                    className="btn btn-success w-100 animated"
                                >
                                    Next
                                </button>
                                <div className="float-end mt-3">
                                    <span>
                                        <Link
                                            className="text-center ms-3 h6"
                                            to="/Registration"
                                        >
                                            Sign Up
                                        </Link>
                                        <span className="ms-1">|</span>
                                        <Link
                                            className="text-center ms-3 h6"
                                            to="/send-otp"
                                        >
                                            Forget Password
                                        </Link>
                                    </span>
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
