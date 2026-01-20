const ProgramSelector = ({ formData, setFormData }) => {
  return (
    <div className="mb-3">
      <label className="form-label">Program</label>
      <select
        className="form-control"
        value={formData.program}
        onChange={(e) =>
          setFormData({ ...formData, program: e.target.value })
        }
      >
        <option value="">Select Program</option>
        <option value="MBA">MBA</option>
        <option value="MS">MS</option>
        <option value="PhD">PhD</option>
      </select>
    </div>
  );
};

export default ProgramSelector;
