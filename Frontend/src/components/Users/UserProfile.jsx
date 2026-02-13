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

import * as faceapi from "face-api.js";




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
  const [photoFile, setPhotoFile] = useState(null);
const [preview, setPreview] = useState("");
const [modelsLoaded, setModelsLoaded] = useState(false);

  const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      setModelsLoaded(true);
      console.log("Face model loaded");
    } catch (err) {
      console.error("Model load error:", err);
    }
  };

  loadModels();
}, []);



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

setPreview(profile.photo || "");


      setLoading(false);
    })();
  }, []);

  /* ================= HANDLER ================= */
  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

const handlePhotoChange = async (e) => {
  try {

    const file = e.target.files[0];
    if (!file) return;

    /* ===============================
       BASIC VALIDATION
    =============================== */

    if (!file.type.startsWith("image/")) {
      ErrorToast("Please upload an image file");
      return;
    }

    // max 5MB
    if (file.size > 5 * 1024 * 1024) {
      ErrorToast("Image too large (max 5MB)");
      return;
    }

    /* ===============================
       CHECK MODEL LOADED
    =============================== */

   if (!modelsLoaded) {
  ErrorToast("Face model still loading...");
  return;
}


    /* ===============================
       IMAGE LOAD
    =============================== */

    const img = await faceapi.bufferToImage(file);

    /* ===============================
       FACE DETECTION
    =============================== */

    const detection = await faceapi.detectSingleFace(
      img,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.5
      })
    );

    // ❌ no face detected
    if (!detection) {
      ErrorToast("No clear face detected");
      return;
    }

    const { x, y, width, height } = detection.box;

    // prevent tiny face
    if (width < 70 || height < 70) {
      ErrorToast("Face too small. Move closer.");
      return;
    }

    /* ===============================
       PASSPORT STYLE AUTO CROP
    =============================== */

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const size = 400; // final image size
    canvas.width = size;
    canvas.height = size;

    // padding around face (head + shoulders)
    const padding = 1.8;

    let cropX = x - width * 0.4;
    let cropY = y - height * 0.6;
    let cropW = width * padding;
    let cropH = height * padding;

    // prevent negative crop values
    cropX = Math.max(0, cropX);
    cropY = Math.max(0, cropY);

    // prevent overflow
    if (cropX + cropW > img.width)
      cropW = img.width - cropX;

    if (cropY + cropH > img.height)
      cropH = img.height - cropY;

    /* ===============================
       DRAW CENTERED FACE
    =============================== */

    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      size,
      size
    );

    /* ===============================
       CANVAS → FILE
    =============================== */

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          ErrorToast("Image processing failed");
          return;
        }

        const croppedFile = new File(
          [blob],
          file.name,
          { type: "image/jpeg" }
        );

        setPhotoFile(croppedFile);
        setPreview(URL.createObjectURL(blob));
      },
      "image/jpeg",
      0.9
    );

  } catch (err) {
    console.error("Face upload error:", err);
    ErrorToast("Face detection failed");
  }
};



  /* ================= UPDATE ================= */
 const handleUpdate = async () => {

  /* =================================================
     🔐 FORCE PASSWORD CHANGE (FIRST LOGIN)
  ================================================= */
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

  /* =================================================
     👤 NORMAL PROFILE UPDATE
  ================================================= */

  if (IsEmpty(form.name)) return ErrorToast("Name required");
  if (IsEmpty(form.nameExtension)) return ErrorToast("Title required");
  if (!IsMobile(form.phone)) return ErrorToast("Valid phone required");
  if (!IsEmail(form.email)) return ErrorToast("Valid email required");

  /* ---------- FormData (PHOTO SUPPORT) ---------- */
  const formData = new FormData();

  formData.append("name", form.name);
  formData.append("nameExtension", form.nameExtension);
  formData.append("phone", form.phone);
  formData.append("email", form.email);

  // 🔥 photo upload
  if (photoFile) {
    formData.append("photo", photoFile);
  }

  const result = await UserUpdateRequest(formData);

  if (result) {
    SuccessToast("Profile updated successfully");
  }
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
          <div className="text-center mb-3">

  <img
    src={preview || "/default-user.png"}
    alt="profile"
    style={{
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      objectFit: "cover"
    }}
  />

  {!form.isFirstLogin && (
    <input
      type="file"
      accept="image/*"
      className="form-control mt-2"
      onChange={handlePhotoChange}
    />
  )}

</div>

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
        {form.department?.departmentName && (
  <input
    className="form-control mb-3"
    value={form.department.departmentName}
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
