import { useEffect, useState } from "react";
import {
  SupervisorDropdownRequest,
  DepartmentSubjectDropdownRequest
} from "../../APIRequest/UserAPIRequest";

const DepartmentSupervisorSelector = ({
  formData,
  setFormData,
  departments
}) => {
  const [subjects, setSubjects] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  /* ================= LOAD SUBJECTS ================= */
  useEffect(() => {
    if (formData.department) {
      DepartmentSubjectDropdownRequest(formData.department)
        .then((data) => {
          setSubjects(data || []);

          // reset subject if department changes
          setFormData((prev) => ({
            ...prev,
            subject: "",
            supervisor: ""
          }));
        });
    } else {
      setSubjects([]);
      setSupervisors([]);
    }
  }, [formData.department]);

  /* ================= LOAD SUPERVISORS ================= */
  useEffect(() => {
    if (!formData.department) {
      setSupervisors([]);
      return;
    }

    // if subjects exist → wait for subject selection
    if (subjects.length > 0 && !formData.subject) {
      setSupervisors([]);
      return;
    }

    SupervisorDropdownRequest(
      formData.department,
      formData.subject || null
    ).then(setSupervisors);

  }, [formData.department, formData.subject, subjects.length]);

  return (
    <>
      {/* ================= DEPARTMENT ================= */}
      <div className="mb-3">
        <h5 className="form-label">3. Department</h5>
        <select
          className="form-control"
          value={formData.department}
          onChange={(e) =>
            setFormData({
              ...formData,
              department: e.target.value,
              subject: "",
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

      {/* ================= SUBJECT (ONLY IF EXISTS) ================= */}
      {subjects.length > 0 && (
        <div className="mb-3">
          <label className="form-label">Subject</label>
          <select
            className="form-control"
            value={formData.subject}
            onChange={(e) =>
              setFormData({
                ...formData,
                subject: e.target.value,
                supervisor: ""
              })
            }
          >
            <option value="">Select Subject</option>
            {subjects.map((s, i) => (
              <option key={i} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ================= SUPERVISOR ================= */}
      <div className="mb-3">
        <h5 className="form-label">4. Supervisor</h5>
        <select
          className="form-control"
          value={formData.supervisor}
          disabled={
            !formData.department ||
            (subjects.length > 0 && !formData.subject)
          }
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
              {s.nameExtension} {s.name}
              {/* {s.subject ? ` (${s.subject})` : ""} */}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default DepartmentSupervisorSelector;
