import { useState } from "react";

const emptyAddress = {
  village: "",
  postOffice: "",
  postalCode: "",
  subDistrict: "",
  district: ""
};

const AddressFields = ({ title, address, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...address,
      [field]: value.toUpperCase()
    });
  };

  return (
    <div className="card p-3 mb-3">
      <h6 className="mb-2">{title}</h6>

      <input
        className="form-control mb-2"
        placeholder="Village / Street"
        value={address.village}
        onChange={e => handleChange("village", e.target.value)}
        required
      />

      <input
        className="form-control mb-2"
        placeholder="Post Office (P.O)"
        value={address.postOffice}
        onChange={e => handleChange("postOffice", e.target.value)}
        required
      />

      <input
        className="form-control mb-2"
        placeholder="Postal Code"
        value={address.postalCode}
        onChange={e => handleChange("postalCode", e.target.value)}
        required
      />

      <input
        className="form-control mb-2"
        placeholder="Sub-District (Upazila)"
        value={address.subDistrict}
        onChange={e => handleChange("subDistrict", e.target.value)}
        required
      />

      <input
        className="form-control"
        placeholder="District"
        value={address.district}
        onChange={e => handleChange("district", e.target.value)}
        required
      />
    </div>
  );
};

const AddressForm = ({ formData, setFormData }) => {
  const [sameAsPresent, setSameAsPresent] = useState(false);

  const handlePresentChange = (addr) => {
    setFormData({
      ...formData,
      presentAddress: addr,
      permanentAddress: sameAsPresent ? addr : formData.permanentAddress
    });
  };

  return (
    <>
      {/* ================= PRESENT ADDRESS ================= */}
      <AddressFields
        title="6. Present Address"
        address={formData.presentAddress || emptyAddress}
        onChange={handlePresentChange}
      />

      {/* ================= SAME AS CHECK ================= */}
      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          checked={sameAsPresent}
          onChange={e => {
            setSameAsPresent(e.target.checked);
            if (e.target.checked) {
              setFormData({
                ...formData,
                permanentAddress: formData.presentAddress
              });
            }
          }}
        />
        <label className="form-check-label">
          Permanent address same as present
        </label>
      </div>

      {/* ================= PERMANENT ADDRESS ================= */}
      {!sameAsPresent && (
        <AddressFields
          title="7. Permanent Address"
          address={formData.permanentAddress || emptyAddress}
          onChange={addr =>
            setFormData({ ...formData, permanentAddress: addr })
          }
        />
      )}

      {/* ================= CONTACT INFO ================= */}
      <div className="card p-3 mt-3">
        <h5 className="mb-2">8. Contact Information</h5>

        <input
          type="text"
          className="form-control mb-2"
          placeholder="Mobile Number"
          value={formData.mobile}
          onChange={e =>
            setFormData({ ...formData, mobile: e.target.value })
          }
          required
        />

        <input
          type="email"
          className="form-control"
          placeholder="Email Address"
          value={formData.email}
          onChange={e =>
            setFormData({ ...formData, email: e.target.value })
          }
          required
        />
      </div>
    </>
  );
};

export default AddressForm;
