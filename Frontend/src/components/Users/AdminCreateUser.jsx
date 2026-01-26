import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AdminCreateUpdateUserRequest,
  DepartmentDropdownRequest,
  DepartmentSubjectDropdownRequest
} from "../../APIRequest/UserAPIRequest";
import {
  IsEmpty,
  IsEmail,
  IsMobile,
  ErrorToast
} from "../../helper/FormHelper";

const AdminCreateUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editUser = location.state?.user || null;

  /* ================= FLAGS ================= */
  const isEdit = !!editUser?._id;

  /* ================= STATE ================= */
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [form, setForm] = useState({
    id: editUser?._id || null,
    name: editUser?.name || "",
    nameExtension: editUser?.nameExtension || "",
    email: editUser?.email || "",
    phone: editUser?.phone || "",
    role: editUser?.role || "",
    department: editUser?.department || "",
    subject: editUser?.subject || ""
  });

  /* ================= LOAD DEPARTMENTS ================= */
  useEffect(() => {
    (async () => {
      const data = await DepartmentDropdownRequest();
      if (Array.isArray(data)) setDepartments(data);
    })();
  }, []);

  /* ================= LOAD SUBJECTS ================= */
  useEffect(() => {
    if (form.role === "Supervisor" && form.department) {
      (async () => {
        const data = await DepartmentSubjectDropdownRequest(form.department);
        setSubjects(Array.isArray(data) ? data : []);
      })();
    } else {
      setSubjects([]);
      setForm(prev => ({ ...prev, subject: "" }));
    }
  }, [form.role, form.department]);

  /* ================= HANDLER ================= */
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
  const { name,nameExtension, email, phone, role, department, subject } = form;

  if (IsEmpty(name)) return ErrorToast("Name required");
  if (IsEmpty(nameExtension)) return ErrorToast("Name Extension required");
  if (!IsEmail(email)) return ErrorToast("Valid email required");
  if (!IsMobile(phone)) return ErrorToast("Valid phone required");
  if (IsEmpty(role)) return ErrorToast("Role required");

  // ✅ department required ONLY on create
  if (!isEdit && role !== "Dean" && IsEmpty(department)) {
    return ErrorToast("Department required");
  }

  if (role === "Supervisor" && subjects.length > 0 && IsEmpty(subject)) {
    return ErrorToast("Subject required");
  }

  const payload = {
    id: form.id,
    name,
    nameExtension,
    email,
    phone,
    role,
    department: isEdit ? undefined : department,
    subject: role === "Supervisor" ? subject : null
  };

  const success = await AdminCreateUpdateUserRequest(payload);

  if (success) {
    navigate("/AdminUsersListPage");
  }
};

  /* ================= UI ================= */
  return (
    <div className="container mt-4">
      <h3 className="mb-4">
        {isEdit ? "✏️ Update Staff User" : "➕ Create Staff User"}
      </h3>

      <div className="card">
        <div className="card-body">
          <div className="row g-3">

            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Full Name"
                value={form.name}
                onChange={e => handleChange("name", e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Name Extension"
                value={form.nameExtension}
                onChange={e => handleChange("nameExtension", e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Email"
                value={form.email}
                onChange={e => handleChange("email", e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Phone"
                value={form.phone}
                onChange={e => handleChange("phone", e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-control"
                value={form.role}
                disabled={isEdit}
                onChange={e => handleChange("role", e.target.value)}
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
                  value={form.department}
                  disabled={isEdit}
                  onChange={e => handleChange("department", e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                {isEdit && (
                  <small className="text-muted">
                    Department cannot be changed after assignment
                  </small>
                )}
              </div>
            )}

            {form.role === "Supervisor" && subjects.length > 0 && (
              <div className="col-md-4">
                <select
                  className="form-control"
                  value={form.subject}
                  onChange={e => handleChange("subject", e.target.value)}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s.name}>
                      {s.name}
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
                {isEdit ? "Update User & Send Email" : "Create User"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateUser;
