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

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    photo: "",
    isFirstLogin: false
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ================= LOAD PROFILE =================
  useEffect(() => {
    const init = async () => {
      const profile = await UserProfileRequest();
      if (!profile) return;
      setForm(profile);
    };
    init();
  }, []);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {

    // 🔐 FORCE PASSWORD CHANGE
    if (form.isFirstLogin) {
      if (IsEmpty(newPassword) || IsEmpty(confirmPassword)) {
        return ErrorToast("Password fields required");
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

    // NORMAL PROFILE UPDATE
    if (IsEmpty(form.name)) return ErrorToast("Name Required");
    if (!IsMobile(form.phone)) return ErrorToast("Valid Mobile Required");
    if (!IsEmail(form.email)) return ErrorToast("Valid Email Required");

    const result = await UserUpdateRequest(form);
    if (result) SuccessToast("Profile Updated");
  };

  if (!user?.email) {
    return <h4 className="text-center mt-5">Loading profile...</h4>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">
        {form.isFirstLogin ? "Change Password" : "My Profile"}
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

          {/* PHONE */}
          <input
            className="form-control mb-3"
            placeholder="Phone"
            value={form.phone || ""}
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
          {form.department && (
            <input
              className="form-control mb-3"
              value={form.department?.Name || "Assigned Department"}
              readOnly
            />
          )}

          {/* 🔐 PASSWORD CHANGE */}
          {form.isFirstLogin && (
            <>
              <input
                type="password"
                className="form-control mb-3"
                placeholder="New Password(must be minimum 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <input
                type="password"
                className="form-control mb-3"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </>
          )}

          <button
            onClick={handleUpdate}
            className="btn btn-success w-100 mt-3"
          >
            {form.isFirstLogin ? "Update Password" : "Update Profile"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
