import { useEffect, useState, useRef } from "react";
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

  /* 🔍 Department search */
  const [deptSearch, setDeptSearch] = useState("");
  const [showDeptList, setShowDeptList] = useState(false);
  const deptRef = useRef(null);

  /* ================= LOAD SUBJECTS ================= */
  useEffect(() => {
    if (formData.department) {
      DepartmentSubjectDropdownRequest(formData.department).then(data => {
        setSubjects(data || []);
        setFormData(prev => ({
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

    if (subjects.length > 0 && !formData.subject) {
      setSupervisors([]);
      return;
    }

    SupervisorDropdownRequest(
      formData.department,
      formData.subject || null
    ).then(setSupervisors);

  }, [formData.department, formData.subject, subjects.length]);

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = e => {
      if (deptRef.current && !deptRef.current.contains(e.target)) {
        setShowDeptList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= FILTERED DEPARTMENTS ================= */
  const filteredDepartments = departments.filter(d =>
    d.name.toLowerCase().startsWith(deptSearch.toLowerCase())
  );

  const selectedDepartmentName =
    departments.find(d => d._id === formData.department)?.name || "";

  return (
    <>
      {/* ================= DEPARTMENT ================= */}
      <div className="mb-3 position-relative" ref={deptRef}>
        <h5 className="form-label">3. Department</h5>

        <input
          type="text"
          className="form-control"
          placeholder="Type to search department..."
          value={deptSearch || selectedDepartmentName}
          onChange={e => {
            setDeptSearch(e.target.value);
            setShowDeptList(true);
          }}
          onFocus={() => setShowDeptList(true)}
        />

        {showDeptList && filteredDepartments.length > 0 && (
          <ul
            className="list-group position-absolute w-100"
            style={{
              zIndex: 1000,
              maxHeight: 220,
              overflowY: "auto"
            }}
          >
            {filteredDepartments.map(d => (
              <li
                key={d._id}
                className="list-group-item list-group-item-action"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    department: d._id,
                    subject: "",
                    supervisor: ""
                  }));
                  setDeptSearch(d.name);
                  setShowDeptList(false);
                }}
              >
                {d.name}
              </li>
            ))}
          </ul>
        )}

        {!filteredDepartments.length && showDeptList && (
          <div className="border p-2 bg-light text-muted">
            No department found
          </div>
        )}
      </div>

      {/* ================= SUBJECT (ONLY IF EXISTS) ================= */}
      {subjects.length > 0 && (
        <div className="mb-3">
          <label className="form-label">Degree</label>
          <select
            className="form-control"
            value={formData.subject}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                subject: e.target.value,
                supervisor: ""
              }))
            }
          >
            <option value="">Select Degree</option>
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
          onChange={e =>
            setFormData(prev => ({
              ...prev,
              supervisor: e.target.value
            }))
          }
        >
          <option value="">Select Supervisor</option>
          {supervisors.map(s => (
            <option key={s._id} value={s._id}>
              {s.nameExtension} {s.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default DepartmentSupervisorSelector;
