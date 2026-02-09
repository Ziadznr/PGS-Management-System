import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  UserProfileRequest,
  UserUpdateRequest
} from "../../APIRequest/UserAPIRequest";
import {
  ErrorToast,
  SuccessToast,
  IsEmail,
  IsMobile,
  IsEmpty
} from "../../helper/FormHelper";

const UserProfile = () => {
  const { user } = useSelector((state) => state.userProfile);

  /* ================= STATE ================= */
  const [form, setForm] = useState({
    name: "",
    nameExtension: "",
    email: "",
    phone: "",
    role: "",
    department: null,
    hall: null,
    photo: "",
    isFirstLogin: false
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    (async () => {
      const profile = await UserProfileRequest();
      if (!profile) return;

      setForm({
        name: profile.name || "",
        nameExtension: profile.nameExtension || "",
        email: profile.email || "",
        phone: profile.phone || "",
        role: profile.role || "",
        department: profile.department || null,
        hall: profile.hall || null,
        photo: profile.photo || "",
        isFirstLogin: profile.isFirstLogin || false
      });

      setLoading(false);
    })();
  }, []);

  /* ================= HANDLER ================= */
  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {

    /* 🔐 FORCE PASSWORD CHANGE */
    if (form.isFirstLogin) {
      if (IsEmpty(newPassword) || IsEmpty(confirmPassword)) {
        return ErrorToast("Password fields are required");
      }

      if (newPassword.length < 6) {
        return ErrorToast("Password must be at least 6 characters");
      }

      if (newPassword !== confirmPassword) {
        return ErrorToast("Passwords do not match");
      }

      const result = await UserUpdateRequest({
        password: newPassword,
        isFirstLogin: false
      });

      if (result) {
        SuccessToast("Password updated. Please login again.");
        window.location.href = "/users/login";
      }
      return;
    }

    /* ================= NORMAL PROFILE UPDATE ================= */
    if (IsEmpty(form.name)) return ErrorToast("Name required");
    if (IsEmpty(form.nameExtension)) return ErrorToast("Title required");
    if (!IsMobile(form.phone)) return ErrorToast("Valid phone required");
    if (!IsEmail(form.email)) return ErrorToast("Valid email required");

    const result = await UserUpdateRequest({
      name: form.name,
      nameExtension: form.nameExtension,
      phone: form.phone,
      email: form.email
    });

    if (result) SuccessToast("Profile updated successfully");
  };

  /* ================= LOADING ================= */
  if (loading || !user?.email) {
    return (
      <h4 className="text-center mt-5">
        Loading profile...
      </h4>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="container mt-4">

      <h2 className="mb-4 text-center">
        {form.isFirstLogin ? "🔐 Change Password" : "👤 My Profile"}
      </h2>

      <div className="row">
        <div className="col-md-6 offset-md-3">

          {/* NAME */}
          <input
            className="form-control mb-3"
            placeholder="Full Name"
            value={form.name}
            disabled={form.isFirstLogin}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          {/* TITLE */}
          <input
            className="form-control mb-3"
            placeholder="Title / Designation"
            value={form.nameExtension}
            disabled={form.isFirstLogin}
            onChange={(e) =>
              handleChange("nameExtension", e.target.value)
            }
          />

          {/* PHONE */}
          <input
            className="form-control mb-3"
            placeholder="Phone"
            value={form.phone}
            disabled={form.isFirstLogin}
            onChange={(e) => handleChange("phone", e.target.value)}
          />

          {/* EMAIL */}
          <input
            className="form-control mb-3"
            value={form.email}
            readOnly
          />

          {/* ROLE */}
          <input
            className="form-control mb-3"
            value={form.role}
            readOnly
          />

          {/* DEPARTMENT */}
          {form.department?.name && (
            <input
              className="form-control mb-3"
              value={form.department.name}
              readOnly
            />
          )}

          {/* HALL (PROVOST) */}
          {form.hall?.name && (
            <input
              className="form-control mb-3"
              value={form.hall.name}
              readOnly
            />
          )}

          {/* 🔐 PASSWORD CHANGE */}
          {form.isFirstLogin && (
            <>
              <input
                type="password"
                className="form-control mb-3"
                placeholder="New Password (min 6 characters)"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
              />

              <input
                type="password"
                className="form-control mb-3"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
              />
            </>
          )}

          {/* ACTION */}
          <button
            onClick={handleUpdate}
            className="btn btn-success w-100 mt-3"
          >
            {form.isFirstLogin
              ? "Update Password"
              : "Update Profile"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
