const ProgramSelector = ({ formData, setFormData }) => {
  return (
    <div className="mb-3">
      <h5 className="form-label ">1. Program</h5>
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
        <option value="LLM">LLM</option>
        <option value="PhD">PhD</option>
      </select>
    </div>
  );
};

export default ProgramSelector;
