import React, { useEffect, useState, useRef } from "react";
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
  const [replaceMark, setReplaceMark] = useState(false);

  /* 🔍 Department search */
  const [deptSearch, setDeptSearch] = useState("");
  const [showDeptList, setShowDeptList] = useState(false);
  const deptRef = useRef(null);

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

    // Replace mode → email locked
    if (replaceMark) {
      return ["name", "nameExtension", "phone"].includes(field);
    }

    // Normal edit → only email editable
    return field === "email";
  };

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

  /* ================= CLICK OUTSIDE (close dept list) ================= */
  useEffect(() => {
    const handleClickOutside = e => {
      if (deptRef.current && !deptRef.current.contains(e.target)) {
        setShowDeptList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= HANDLER ================= */
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  /* ================= FILTERED DEPARTMENTS ================= */
  const filteredDepartments = departments.filter(d =>
    d.name.toLowerCase().startsWith(deptSearch.toLowerCase())
  );

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    const { name, nameExtension, email, phone, role, department, subject } = form;

    if (!isEdit || replaceMark) {
      if (IsEmpty(name)) return ErrorToast("Name required");
      if (IsEmpty(nameExtension)) return ErrorToast("Name Extension required");
      if (!IsMobile(phone)) return ErrorToast("Valid phone required");
    }

    if (!IsEmail(email)) return ErrorToast("Valid email required");
    if (IsEmpty(role)) return ErrorToast("Role required");

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
  subject: role === "Supervisor" ? subject : null,
  ...(isEdit ? {} : { department })
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

      <div className="card">
        <div className="card-body">
          <div className="row g-3">

            {isEdit && (
              <div className="col-md-12">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={replaceMark}
                    onChange={e => setReplaceMark(e.target.checked)}
                  />
                  <label className="form-check-label">
                    Replace person (Name, Title, Phone)
                  </label>
                </div>
                <small className="text-muted">
                  Panel email will remain unchanged
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
                <option value="Chairman">Chairman</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </div>

            {/* 🔍 DEPARTMENT SEARCH */}
            {form.role && form.role !== "Dean" && (
              <div className="col-md-4 position-relative" ref={deptRef}>
                <input
                  className="form-control"
                  placeholder="Type to search department..."
                  value={
                    deptSearch ||
                    departments.find(d => d._id === form.department)?.name ||
                    ""
                  }
                  disabled={isEdit}
                  onChange={e => {
                    setDeptSearch(e.target.value);
                    setShowDeptList(true);
                  }}
                  onFocus={() => setShowDeptList(true)}
                />

                {showDeptList && !isEdit && filteredDepartments.length > 0 && (
                  <ul
                    className="list-group position-absolute w-100"
                    style={{ zIndex: 1000, maxHeight: 200, overflowY: "auto" }}
                  >
                    {filteredDepartments.map(d => (
                      <li
                        key={d._id}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          handleChange("department", d._id);
                          setDeptSearch(d.name);
                          setShowDeptList(false);
                        }}
                      >
                        {d.name}
                      </li>
                    ))}
                  </ul>
                )}

                {isEdit && (
                  <small className="text-muted">
                    Department cannot be changed
                  </small>
                )}
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
                  <option value="">Select Degree</option>
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
