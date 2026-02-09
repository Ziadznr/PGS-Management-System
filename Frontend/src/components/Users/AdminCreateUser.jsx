import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  AdminCreateUpdateUserRequest,
  DepartmentDropdownRequest,
  DepartmentSubjectDropdownRequest
} from "../../APIRequest/UserAPIRequest";
import {
 HallDropdownRequest
} from "../../APIRequest/HallAPIRequest";
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

  const isEdit = !!editUser?._id;

  /* ================= DATA ================= */
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [halls, setHalls] = useState([]);

  const [replaceMark, setReplaceMark] = useState(false);

  /* ================= FORM ================= */
  const [form, setForm] = useState({
    id: editUser?._id || null,
    name: editUser?.name || "",
    nameExtension: editUser?.nameExtension || "",
    email: editUser?.email || "",
    phone: editUser?.phone || "",
    role: editUser?.role || "",
    department: editUser?.department || "",
    hall: editUser?.hall || "",
    subject: editUser?.subject || ""
  });

  /* ================= TITLE OPTIONS ================= */
  const titleOptions = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Lecturer",
    "Senior Lecturer",
    "Instructor"
  ];

  /* ================= FIELD PERMISSIONS ================= */
  const canEdit = field => {
    if (!isEdit) return true;

    if (replaceMark) {
      return ["name", "nameExtension", "phone"].includes(field);
    }

    return field === "email";
  };

  /* ================= LOAD DROPDOWNS ================= */
  useEffect(() => {
    DepartmentDropdownRequest().then(setDepartments);
    HallDropdownRequest().then(setHalls);
  }, []);

  /* ================= LOAD SUBJECTS ================= */
  useEffect(() => {
    if (form.role === "Supervisor" && form.department) {
      DepartmentSubjectDropdownRequest(form.department)
        .then(setSubjects);
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
    const {
      name,
      nameExtension,
      email,
      phone,
      role,
      department,
      hall,
      subject
    } = form;

    if (!isEdit || replaceMark) {
      if (IsEmpty(name)) return ErrorToast("Name required");
      if (IsEmpty(nameExtension)) return ErrorToast("Title required");
      if (!IsMobile(phone)) return ErrorToast("Valid phone required");
    }

    if (!IsEmail(email)) return ErrorToast("Valid email required");
    if (IsEmpty(role)) return ErrorToast("Role required");

    // 🔒 CREATE-ONLY VALIDATION
if (!isEdit) {
  if (["Chairman", "Supervisor"].includes(role) && IsEmpty(department)) {
    return ErrorToast("Department required");
  }

  if (role === "Provost" && IsEmpty(hall)) {
    return ErrorToast("Hall required");
  }
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
      department: ["Chairman", "Supervisor"].includes(role) ? department : null,
      hall: role === "Provost" ? hall : null,
      subject: role === "Supervisor" ? subject : null
    };

    const success = await AdminCreateUpdateUserRequest(payload);
    if (success) navigate("/AdminUsersListPage");
  };

  /* ================= UI ================= */
  return (
    <div className="container mt-4">
      <h3 className="mb-4">
        {isEdit ? "✏️ Update Staff User" : "➕ Create Staff User"}
      </h3>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-3">

            {isEdit && (
              <div className="col-12">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={replaceMark}
                    onChange={e => setReplaceMark(e.target.checked)}
                  />
                  <label className="form-check-label">
                    Replace person (name, title, phone)
                  </label>
                </div>
                <small className="text-muted">
                  Email stays unchanged when replacing
                </small>
              </div>
            )}

            {/* NAME */}
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Full Name"
                value={form.name}
                disabled={!canEdit("name")}
                onChange={e => handleChange("name", e.target.value)}
              />
            </div>

            {/* TITLE */}
            <div className="col-md-4">
              <select
                className="form-control"
                value={form.nameExtension}
                disabled={!canEdit("nameExtension")}
                onChange={e => handleChange("nameExtension", e.target.value)}
              >
                <option value="">Select Title</option>
                {titleOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* EMAIL */}
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Email"
                value={form.email}
                disabled={!canEdit("email")}
                onChange={e => handleChange("email", e.target.value)}
              />
            </div>

            {/* PHONE */}
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Phone"
                value={form.phone}
                disabled={!canEdit("phone")}
                onChange={e => handleChange("phone", e.target.value)}
              />
            </div>

            {/* ROLE */}
            <div className="col-md-4">
              <select
                className="form-control"
                value={form.role}
                disabled={isEdit}
                onChange={e => handleChange("role", e.target.value)}
              >
                <option value="">Select Role</option>
                <option value="Dean">Dean</option>
                <option value="VC">VC</option>
                <option value="Registrar">Registrar</option>
                <option value="PGS Specialist">PGS Specialist</option>
                <option value="Chairman">Chairman</option>
                <option value="Provost">Provost</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </div>

            {/* DEPARTMENT */}
            {["Chairman", "Supervisor"].includes(form.role) && (
              <div className="col-md-4">
                <select
                  className="form-control"
                  value={form.department}
                  disabled={isEdit}
                  onChange={e => handleChange("department", e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* HALL */}
            {form.role === "Provost" && (
              <div className="col-md-4">
                <select
                  className="form-control"
                  value={form.hall}
                  disabled={isEdit}
                  onChange={e => handleChange("hall", e.target.value)}
                >
                  <option value="">Select Hall</option>
                  {halls.map(h => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* SUBJECT */}
            {form.role === "Supervisor" && subjects.length > 0 && (
              <div className="col-md-4">
                <select
                  className="form-control"
                  value={form.subject}
                  disabled={isEdit}
                  onChange={e => handleChange("subject", e.target.value)}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* SUBMIT */}
            <div className="col-md-4">
              <button
                className="btn btn-success w-100"
                onClick={handleSubmit}
              >
                {isEdit ? "Update & Send Email" : "Create User"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateUser;
