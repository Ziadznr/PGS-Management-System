import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AdminCreateUserRequest,
  DepartmentDropdownRequest
} from "../../APIRequest/UserAPIRequest";
import { IsEmpty, IsEmail, IsMobile, ErrorToast } from "../../helper/FormHelper";

const AdminCreateUser = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: ""
  });

  // ================= LOAD DEPARTMENTS =================
  useEffect(() => {
    DepartmentDropdownRequest().then(setDepartments);
  }, []);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // ================= CREATE USER =================
  const handleSubmit = async () => {
    const { name, email, phone, role, department } = form;

    if (IsEmpty(name)) return ErrorToast("Name required");
    if (!IsEmail(email)) return ErrorToast("Valid email required");
    if (!IsMobile(phone)) return ErrorToast("Valid phone required");
    if (IsEmpty(role)) return ErrorToast("Role required");

    if (role !== "Dean" && IsEmpty(department)) {
      return ErrorToast("Department required");
    }

    const payload = {
      name,
      email,
      phone,
      role,
      department: role === "Dean" ? null : department
    };

    const success = await AdminCreateUserRequest(payload);

    if (success) {
      navigate("/AdminUsersListPage"); // ✅ redirect
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">➕ Create Staff User</h3>

      <div className="card">
        <div className="card-body">
          <div className="row g-3">

            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Full Name"
                onChange={e => handleChange("name", e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Email"
                onChange={e => handleChange("email", e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Phone"
                onChange={e => handleChange("phone", e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-control"
                onChange={e => {
                  handleChange("role", e.target.value);
                  handleChange("department", "");
                }}
              >
                <option value="">Select Role</option>
                <option value="Dean">Dean</option>
                <option value="Chairman">Chairman</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </div>

            {form.role && form.role !== "Dean" && (
              <div className="col-md-4">
                <select
                  className="form-control"
                  onChange={e => handleChange("department", e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="col-md-4">
              <button
                className="btn btn-success w-100"
                onClick={handleSubmit}
              >
                Create User
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateUser;
