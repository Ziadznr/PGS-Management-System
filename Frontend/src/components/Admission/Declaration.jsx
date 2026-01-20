const Declaration = ({ formData, setFormData }) => {
  return (
    <div className="form-check mt-3">
      <input
        type="checkbox"
        className="form-check-input"
        checked={formData.declarationAccepted}
        onChange={(e) =>
          setFormData({
            ...formData,
            declarationAccepted: e.target.checked
          })
        }
      />
      <label className="form-check-label">
        I declare all information is correct
      </label>
    </div>
  );
};

export default Declaration;
