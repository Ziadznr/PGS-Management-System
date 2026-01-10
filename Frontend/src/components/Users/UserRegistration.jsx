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
  FacultyDropdownRequest,
  DepartmentDropdownRequest
} from "../../APIRequest/UserAPIRequest";

const UserRegistration = () => {

  const nameRef = useRef();
  const phoneRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const facultyRef = useRef();
  const departmentRef = useRef();

  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);

  // ================= LOAD FACULTIES =================
  useEffect(() => {
    FacultyDropdownRequest().then(setFaculties);
  }, []);

  // ================= LOAD DEPARTMENTS =================
  const handleFacultyChange = async (facultyID) => {
    if (!facultyID) {
      setDepartments([]);
      return;
    }
    const deps = await DepartmentDropdownRequest(facultyID);
    setDepartments(deps);
  };

  // ================= REGISTER =================
  const onRegister = async () => {

    const name = nameRef.current.value;
    const phone = phoneRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const faculty = facultyRef.current?.value || null;
    const department = departmentRef.current?.value || null;

    // -------- Validation --------
    if (IsEmpty(name)) return ErrorToast("Name required");
    if (!IsMobile(phone)) return ErrorToast("Valid phone required");
    if (!IsEmail(email)) return ErrorToast("Valid email required");
    if (IsEmpty(password)) return ErrorToast("Password required");
    if (IsEmpty(role)) return ErrorToast("Role required");

    if (!faculty) return ErrorToast("Faculty required");
    if (!department) return ErrorToast("Department required");

    // -------- Payload --------
    const payload = {
      name,
      phone,
      email,
      password,
      role,
      faculty,
      department
    };

    const result = await UserRegisterRequest(payload);
    if (result) navigate("/users/login");
  };

  return (
    <div className="container">
      <h2 className="text-center mt-4">User Registration</h2>

      <div className="row mt-3">
        <div className="col-md-6 offset-md-3">

          <input ref={nameRef} className="form-control mt-3" placeholder="Full Name" />
          <input ref={phoneRef} className="form-control mt-3" placeholder="Mobile Number" />
          <input ref={emailRef} className="form-control mt-3" placeholder="Email Address" />
          <input ref={passwordRef} className="form-control mt-3" type="password" placeholder="Password" />

          {/* ROLE */}
          <select
            className="form-control mt-3"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setDepartments([]);
            }}
          >
            <option value="">Select Role</option>
            <option value="Student">Student</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Chairman">Chairman</option>
          </select>

          {/* FACULTY */}
          {role && (
            <select
              ref={facultyRef}
              className="form-control mt-3"
              onChange={(e) => handleFacultyChange(e.target.value)}
            >
              <option value="">Select Faculty</option>
              {faculties.map(f => (
                <option key={f._id} value={f._id}>{f.Name}</option>
              ))}
            </select>
          )}

          {/* DEPARTMENT */}
          {role && (
            <select ref={departmentRef} className="form-control mt-3">
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.Name}</option>
              ))}
            </select>
          )}

          <button onClick={onRegister} className="btn btn-success mt-4 w-100">
            Register
          </button>

        </div>
      </div>
    </div>
  );
};

export default UserRegistration;
