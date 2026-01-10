import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  UserProfileRequest,
  UserUpdateRequest,
  FacultyDropdownRequest,
  DepartmentDropdownRequest
} from "../../APIRequest/UserAPIRequest";
import {
  ErrorToast,
  SuccessToast,
  IsEmail,
  IsMobile,
  IsEmpty,
  getBase64
} from "../../helper/FormHelper";

const UserProfile = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.userProfile);

  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    faculty: "",
    department: "",
    photo: ""
  });

  // ================= LOAD PROFILE =================
  useEffect(() => {
    const init = async () => {
      const profile = await UserProfileRequest();
      if (!profile) return;

      setForm(profile);
      setPreview(profile.photo || null);

      const facs = await FacultyDropdownRequest();
      setFaculties(facs);
    };
    init();
  }, []);

  // ================= LOAD DEPARTMENTS =================
  useEffect(() => {
    if (form.faculty) {
      DepartmentDropdownRequest(form.faculty).then(setDepartments);
    }
  }, [form.faculty]);

  // ================= HANDLE INPUT =================
  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ================= PHOTO =================
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await getBase64(file);
    setPreview(base64);
    handleChange("photo", base64);
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (IsEmpty(form.name)) return ErrorToast("Name Required");
    if (!IsMobile(form.phone)) return ErrorToast("Valid Mobile Required");
    if (!IsEmail(form.email)) return ErrorToast("Valid Email Required");

    const result = await UserUpdateRequest(form);
    if (result) {
      SuccessToast("Profile Updated");
      const refreshed = await UserProfileRequest();
      setForm(refreshed);
      setPreview(refreshed.photo || null);
    }
  };

  if (!user?.email) {
    return <h4 className="text-center mt-5">Loading profile...</h4>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">My Profile</h2>

      <div className="row">
        <div className="col-md-6 offset-md-3">

          {/* PHOTO */}
          <div className="text-center mb-3">
            <img
              src={preview || "/default-avatar.png"}
              alt="Profile"
              className="rounded-circle"
              style={{ width: 120, height: 120, objectFit: "cover" }}
            />
            <input
              type="file"
              accept="image/*"
              className="form-control mt-2"
              onChange={handlePhotoChange}
            />
          </div>

          {/* NAME */}
          <input
            className="form-control mb-3"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          {/* PHONE */}
          <input
            className="form-control mb-3"
            placeholder="Phone"
            value={form.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
          />

          {/* EMAIL (READ ONLY) */}
          <input
            className="form-control mb-3"
            value={form.email}
            readOnly
          />

          {/* ROLE (READ ONLY) */}
          <input
            className="form-control mb-3"
            value={form.role}
            readOnly
          />

          {/* FACULTY */}
          {form.faculty && (
            <select className="form-control mb-3" disabled>
              {faculties.map((f) => (
                <option key={f._id} value={f._id} selected={f._id === form.faculty}>
                  {f.Name}
                </option>
              ))}
            </select>
          )}

          {/* DEPARTMENT */}
          {form.department && (
            <select className="form-control mb-3" disabled>
              {departments.map((d) => (
                <option key={d._id} value={d._id} selected={d._id === form.department}>
                  {d.Name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleUpdate}
            className="btn btn-success w-100 mt-3"
          >
            Update Profile
          </button>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
