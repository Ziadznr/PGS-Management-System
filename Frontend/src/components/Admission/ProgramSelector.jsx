const ProgramSelector = ({ formData, setFormData }) => {
  const handleProgramChange = (e) => {
    const program = e.target.value;

    setFormData(prev => ({
      ...prev,
      program,
      department: "",
      subject: "",
      supervisor: ""
    }));
  };

  return (
    <div className="mb-3">
      <h5 className="form-label">1. Program</h5>

      <select
        className="form-control"
        value={formData.program}
        onChange={handleProgramChange}
      >
        <option value="">Select Program</option>
        <option value="MS">MS</option>
        <option value="MBA">MBA</option>
        <option value="LLM">LLM</option>
        <option value="PhD">PhD</option>
      </select>
    </div>
  );
};

export default ProgramSelector;
