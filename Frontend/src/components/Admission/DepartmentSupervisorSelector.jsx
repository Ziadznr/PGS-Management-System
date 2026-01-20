import { useEffect, useState } from "react";
import { SupervisorDropdownRequest } from "../../APIRequest/UserAPIRequest";

const DepartmentSupervisorSelector = ({
  formData,
  setFormData,
  departments
}) => {
  const [supervisors, setSupervisors] = useState([]);

  useEffect(() => {
    if (formData.department) {
      SupervisorDropdownRequest(formData.department)
        .then(setSupervisors);
    } else {
      setSupervisors([]);
    }
  }, [formData.department]);

  return (
    <>
      {/* DEPARTMENT */}
      <div className="mb-3">
        <label className="form-label">Department</label>
        <select
          className="form-control"
          value={formData.department}
          onChange={(e) =>
            setFormData({
              ...formData,
              department: e.target.value,
              supervisor: ""
            })
          }
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* SUPERVISOR */}
      <div className="mb-3">
        <label className="form-label">Supervisor</label>
        <select
          className="form-control"
          value={formData.supervisor}
          disabled={!formData.department}
          onChange={(e) =>
            setFormData({
              ...formData,
              supervisor: e.target.value
            })
          }
        >
          <option value="">Select Supervisor</option>
          {supervisors.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default DepartmentSupervisorSelector;
