import React, { useState } from "react";

const PersonalInfoForm = ({ formData, setFormData }) => {
  const [dobType, setDobType] = useState("text");

  // 🔹 Force uppercase for text inputs only
  const handleUppercaseChange = (field) => (e) => {
    setFormData({
      ...formData,
      [field]: e.target.value.toUpperCase()
    });
  };

  return (
    <div className="card mb-3 p-3">
      <h5 className="mb-3">5. Personal Information</h5>

      <input
        className="form-control mb-2"
        placeholder="Applicant Name"
        value={formData.applicantName || ""}
        onChange={handleUppercaseChange("applicantName")}
      />

      <input
        className="form-control mb-2"
        placeholder="Father's Name"
        value={formData.fatherName || ""}
        onChange={handleUppercaseChange("fatherName")}
      />

      <input
        className="form-control mb-2"
        placeholder="Mother's Name"
        value={formData.motherName || ""}
        onChange={handleUppercaseChange("motherName")}
      />

      {/* 🔹 Date of Birth (text → date on focus) */}
      <input
        type={dobType}
        className="form-control mb-2"
        placeholder="Date of Birth"
        value={formData.dateOfBirth || ""}
        onFocus={() => setDobType("date")}
        onBlur={() => {
          if (!formData.dateOfBirth) setDobType("text");
        }}
        onChange={e =>
          setFormData({ ...formData, dateOfBirth: e.target.value })
        }
      />

      <input
        className="form-control mb-2"
        placeholder="Nationality"
        value={formData.nationality || ""}
        onChange={handleUppercaseChange("nationality")}
      />

      <select
        className="form-control mb-2"
        value={formData.maritalStatus || ""}
        onChange={e =>
          setFormData({ ...formData, maritalStatus: e.target.value })
        }
      >
        <option value="">Marital Status</option>
        <option value="Single">Single</option>
        <option value="Married">Married</option>
      </select>

      <select
        className="form-control"
        value={formData.sex || ""}
        onChange={e =>
          setFormData({ ...formData, sex: e.target.value })
        }
      >
        <option value="">Sex</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    </div>
  );
};

export default PersonalInfoForm;
