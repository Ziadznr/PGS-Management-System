import React, { useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { ErrorToast, IsEmail, IsEmpty, IsMobile } from "../../helper/FormHelper";
import { RegistrationRequest } from "../../APIRequest/AdminAPIRequest";

const Registration = () => {
    // Correctly initialize refs
    const emailRef = useRef();
    const firstNameRef = useRef();
    const lastNameRef = useRef();
    const mobileRef = useRef();
    const passwordRef = useRef();

    const navigate = useNavigate();

    const onRegistration = async () => {
        const email = emailRef.current.value;
        const fastName = firstNameRef.current.value;
        const lastName = lastNameRef.current.value;
        const mobile = mobileRef.current.value;
        const password = passwordRef.current.value;

        // Sample base64 photo string
        const photo = "data:image/jpeg;base64,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";

        if (!IsEmail(email)) {
            ErrorToast("Valid Email Address Required !");
        } else if (IsEmpty(fastName)) {
            ErrorToast("First Name Required !");
        } else if (IsEmpty(lastName)) {
            ErrorToast("Last Name Required !");
        } else if (!IsMobile(mobile)) {
            ErrorToast("Valid Mobile Required !");
        } else if (IsEmpty(password)) {
            ErrorToast("Password Required !");
        } else {
            let result = await RegistrationRequest(email, fastName, lastName, mobile, password, photo);
            if (result === true) {
                navigate("/login");
            }
        }
    };

    return (
        <div className="container">
            <h1 className="text-center mt-3">User Registration</h1>
            <div className="row mt-3">
                <div className="col-md-6 offset-md-3">
                    <input
                        ref={emailRef}
                        placeholder="User Email"
                        className="form-control mt-3"
                        type="email"
                    />
                    <input
                        ref={firstNameRef}
                        placeholder="First Name"
                        className="form-control mt-3"
                        type="text"
                    />
                    <input
                        ref={lastNameRef}
                        placeholder="Last Name"
                        className="form-control mt-3"
                        type="text"
                    />
                    <input
                        ref={mobileRef}
                        placeholder="Mobile Number"
                        className="form-control mt-3"
                        type="text"
                    />
                    <input
                        ref={passwordRef}
                        placeholder="Password"
                        className="form-control mt-3"
                        type="password"
                    />
                    <button onClick={onRegistration} className="btn btn-primary mt-3 w-100">
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Registration;
