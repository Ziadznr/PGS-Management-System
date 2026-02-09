import { useEffect, useState, useRef } from "react";
import {
  SupervisorDropdownRequest,
  DepartmentSubjectDropdownRequest
} from "../../APIRequest/UserAPIRequest";

const DepartmentSupervisorSelector = ({
  formData,
  setFormData,
  departments   // already filtered by selected program
}) => {
  const [subjects, setSubjects] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  /* 🔍 Department search */
  const [deptSearch, setDeptSearch] = useState("");
  const [showDeptList, setShowDeptList] = useState(false);
  const deptRef = useRef(null);

//   /* ================= RESET DEPARTMENT SEARCH ================= */
// useEffect(() => {
//   if (!formData.department) {
//     setDeptSearch("");
//   }
// }, [formData.department]);

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
  }, [formData.department, setFormData]);

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
    `${d.departmentName} ${d.departmentCode}`
      .toLowerCase()
      .includes(deptSearch.toLowerCase())
  );

  const selectedDepartment = departments.find(
    d => d._id === formData.department
  );

  const selectedDepartmentLabel = selectedDepartment
    ? `${selectedDepartment.departmentName} (${selectedDepartment.departmentCode})`
    : "";

  return (
    <>
      {/* ================= DEPARTMENT ================= */}
      <div className="mb-3 position-relative" ref={deptRef}>
        <h5 className="form-label">3. Department</h5>

        <input
  type="text"
  className="form-control"
  placeholder="Type to search department..."
  value={
    showDeptList
      ? deptSearch
      : selectedDepartmentLabel
  }
  onChange={e => {
    setDeptSearch(e.target.value);
    setShowDeptList(true);
  }}
  onFocus={() => {
    setShowDeptList(true);
    setDeptSearch("");
  }}
  disabled={!departments.length}
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
                  setDeptSearch(
                    `${d.departmentName} (${d.departmentCode})`
                  );
                  setShowDeptList(false);
                }}
              >
                <div className="fw-medium">
                  {d.departmentName}
                </div>
                <small className="text-muted">
                  Code: {d.departmentCode}
                </small>
              </li>
            ))}
          </ul>
        )}

        {showDeptList && !filteredDepartments.length && (
          <div className="border p-2 bg-light text-muted">
            No department found
          </div>
        )}
      </div>

      {/* ================= SUBJECT (ONLY IF EXISTS) ================= */}
      {subjects.length > 0 && (
        <div className="mb-3">
          <label className="form-label">Subject</label>
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
