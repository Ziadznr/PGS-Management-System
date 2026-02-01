import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ErrorToast,
  IsEmail,
  IsEmpty,
  IsMobile
} from "../../helper/FormHelper";

import {
  UserRegisterRequest,
  DepartmentDropdownRequest
} from "../../APIRequest/UserAPIRequest";

import logo from "../../assets/images/ps.png";

// 🔒 FIXED FACULTY (PGS)
const PGS_FACULTY_ID = "PUT_PGS_FACULTY_OBJECT_ID_HERE";

const UserRegistration = () => {

  const nameRef = useRef();
  const phoneRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const departmentRef = useRef();

  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [departments, setDepartments] = useState([]);

  // ================= LOAD DEPARTMENTS =================
  useEffect(() => {
    if (role && role !== "Dean") {
      DepartmentDropdownRequest().then(setDepartments);
    } else {
      setDepartments([]);
    }
  }, [role]);

  // ================= REGISTER =================
  const onRegister = async () => {

    const name = nameRef.current.value.trim();
    const phone = phoneRef.current.value.trim();
    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value.trim();
    const department = departmentRef.current?.value || null;

    // -------- Validation --------
    if (IsEmpty(name)) return ErrorToast("Name required");
    if (!IsMobile(phone)) return ErrorToast("Valid phone required");
    if (!IsEmail(email)) return ErrorToast("Valid email required");
    if (IsEmpty(password)) return ErrorToast("Password required");
    if (IsEmpty(role)) return ErrorToast("Role required");

    // ❌ Department not needed for Dean
    if (role !== "Dean" && !department) {
      return ErrorToast("Department required");
    }

    // -------- Payload --------
    const payload = {
      name,
      phone,
      email,
      password,
      role,
      faculty: PGS_FACULTY_ID, // ✅ AUTO PGS
      department: role === "Dean" ? null : department
    };

    const result = await UserRegisterRequest(payload);
    if (result) navigate("/users/login");
  };

  return (
    <div className="container">
  <div className="row justify-content-center">
    <div className="col-md-8 col-lg-6 center-screen">
      <div className="card login-card p-4">
        <div className="card-body text-center">

          {/* Logo */}
          <img src={logo} className="login-logo" alt="Logo" />

          {/* Title */}
          <h3 className="mb-2">User Registration</h3>
          <p className="text-muted mb-4">
            Create your account to continue
          </p>

          {/* Full Name */}
          <input
            ref={nameRef}
            className="form-control mb-3"
            placeholder="Full Name"
          />

          {/* Mobile Number */}
          <input
            ref={phoneRef}
            className="form-control mb-3"
            placeholder="Mobile Number"
          />

          {/* Email */}
          <input
            ref={emailRef}
            className="form-control mb-3"
            placeholder="Email Address"
          />

          {/* Password */}
          <input
            ref={passwordRef}
            type="password"
            className="form-control mb-3"
            placeholder="Password"
          />

          {/* Role */}
          <select
            className="form-control mb-3"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Select Role</option>
            <option value="Student">Student</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Chairman">Chairman</option>
            <option value="Dean">Dean</option>
          </select>

          {/* Department (hidden for Dean) */}
          {role && role !== "Dean" && (
            <select
              ref={departmentRef}
              className="form-control mb-3"
            >
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          {/* Faculty (fixed) */}
          <div className="form-control mb-4 bg-light text-start">
            Faculty: <strong>PGS</strong>
          </div>

          {/* Register Button */}
          <button
            onClick={onRegister}
            className="btn login-btn w-100"
          >
            Register
          </button>

        </div>
      </div>
    </div>
  </div>
</div>

  );
};

export default UserRegistration;
