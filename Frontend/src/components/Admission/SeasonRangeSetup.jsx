import React, { useEffect, useState } from "react";
import {
  CreateAdmissionSeasonRequest,
  AdmissionSeasonListRequest,
  SetDepartmentRegistrationRangeRequest,
  GetAllDepartmentRangesRequest
} from "../../APIRequest/AdmissionAPIRequest";

import {
  DepartmentDropdownRequest,
  DepartmentSubjectDropdownRequest
} from "../../APIRequest/UserAPIRequest";

import { ErrorToast, IsEmpty, SuccessToast } from "../../helper/FormHelper";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const SeasonRangeSetup = () => {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [seasonId, setSeasonId] = useState("");
  const [seasons, setSeasons] = useState([]);

  const [season, setSeason] = useState({
    seasonName: "",
    academicYear: ""
  });

  const [range, setRange] = useState({
    department: "",
    subject: "",
    startRegNo: "",
    endRegNo: ""
  });

  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lastRegNo, setLastRegNo] = useState(null);

  /* ================= LOAD INITIAL DATA ================= */
  useEffect(() => {
    (async () => {
      const d = await DepartmentDropdownRequest();
      const s = await AdmissionSeasonListRequest();

      if (Array.isArray(d)) setDepartments(d);
      if (Array.isArray(s)) setSeasons(s);
    })();
  }, []);

  useEffect(() => {
  if (!seasonId || !range.department) return;

  // department only
  if (subjects.length === 0) {
    fetchLastRegNo(range.department, null);
  }

  // department + subject
  if (subjects.length > 0 && range.subject) {
    fetchLastRegNo(range.department, range.subject);
  }
}, [seasonId, range.department, range.subject, subjects.length]); 



  /* ================= FIND LAST REG NO ================= */
  const fetchLastRegNo = async (deptId, subjectId) => {
    if (!seasonId || !deptId) {
      setLastRegNo(null);
      return;
    }

    const data = await GetAllDepartmentRangesRequest();
    if (!Array.isArray(data)) {
      setLastRegNo(null);
      return;
    }

    const matched = data.filter(r =>
      r.admissionSeason?._id === seasonId &&
      r.department?._id === deptId &&
      (subjectId
        ? r.subjectId === subjectId
        : r.subjectId == null)
    );

    if (matched.length === 0) {
      setLastRegNo(null);
      return;
    }

    const maxEnd = Math.max(...matched.map(r => r.endRegNo));
    setLastRegNo(maxEnd);

    // 🔥 auto-suggest next start
    setRange(prev => ({
      ...prev,
      startRegNo: maxEnd + 1
    }));
  };

  /* ================= DEPARTMENT CHANGE ================= */
  const onDepartmentChange = async (deptId) => {
  setRange(prev => ({
    ...prev,
    department: deptId,
    subject: "",
    startRegNo: "",
    endRegNo: ""
  }));

  if (!deptId) {
    setSubjects([]);
    setLastRegNo(null);
    return;
  }

  const subs = await DepartmentSubjectDropdownRequest(deptId);
  const list = Array.isArray(subs) ? subs : [];
  setSubjects(list);

  // 🔥 auto-load last reg no immediately
  if (list.length === 0) {
    fetchLastRegNo(deptId, null);
  }
};


  /* ================= CREATE SEASON ================= */
  const createSeason = async () => {
    const { seasonName, academicYear } = season;

    if (IsEmpty(seasonName) || IsEmpty(academicYear)) {
      ErrorToast("Season name and academic year are required");
      return;
    }

    const confirm = await Swal.fire({
      title: "Create Admission Season?",
      text: `${seasonName} (${academicYear})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Create"
    });

    if (!confirm.isConfirmed) return;

    const res = await CreateAdmissionSeasonRequest(season);
    if (res?._id) {
      SuccessToast("Season created successfully");
      setSeasonId(res._id);
      setSeasons(prev => [res, ...prev]);
      setSeason({ seasonName: "", academicYear: "" });
    }
  };

  /* ================= ADD RANGE ================= */
  const addRange = async () => {
    if (!seasonId) {
      ErrorToast("Select a season first");
      return;
    }

    if (
      IsEmpty(range.department) ||
      IsEmpty(range.startRegNo) ||
      IsEmpty(range.endRegNo)
    ) {
      ErrorToast("All fields are required");
      return;
    }

    if (subjects.length > 0 && IsEmpty(range.subject)) {
      ErrorToast("Please select a subject");
      return;
    }

    if (Number(range.startRegNo) >= Number(range.endRegNo)) {
      ErrorToast("End registration number must be greater than start");
      return;
    }

    const payload = {
      admissionSeason: seasonId,
      department: range.department,
      startRegNo: Number(range.startRegNo),
      endRegNo: Number(range.endRegNo)
    };

    if (range.subject) payload.subjectId = range.subject;

    const success = await SetDepartmentRegistrationRangeRequest(payload);
 if (success) {
  const deptId = range.department;
  const subjectId = range.subject || null;

  setRange(prev => ({
    ...prev,
    subject: "",
    endRegNo: ""
  }));

  // 🔥 re-calculate last reg no immediately
  await fetchLastRegNo(deptId, subjectId);

  const next = await Swal.fire({
    title: "Range Added",
    text: "Add more ranges?",
    icon: "success",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Go to Range List"
  });

  if (!next.isConfirmed) navigate("/admission-seasons");
}

  };

  /* ================= UI ================= */
  return (
    <div className="container-fluid my-4">

      {/* SELECT SEASON */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>Select Admission Season</h5>
          <select
            className="form-select mt-2"
            value={seasonId}
            onChange={e => setSeasonId(e.target.value)}
          >
            <option value="">-- Select Season --</option>
            {seasons.map(s => (
              <option key={s._id} value={s._id}>
                {s.seasonName} ({s.academicYear})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CREATE SEASON */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>Create New Season</h5>
          <hr />
          <div className="row">
            <div className="col-md-4">
              <label>Season</label>
              <select
                className="form-select"
                value={season.seasonName}
                onChange={e =>
                  setSeason({ ...season, seasonName: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="January-June">January-June</option>
                <option value="July-December">July-December</option>
              </select>
            </div>

            <div className="col-md-4">
              <label>Academic Year</label>
              <input
                className="form-control"
                value={season.academicYear}
                onChange={e =>
                  setSeason({ ...season, academicYear: e.target.value })
                }
              />
            </div>

            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-success w-100" onClick={createSeason}>
                Create Season
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RANGE SETUP */}
      {seasonId && (
        <div className="card">
          <div className="card-body">
            <h5>Department Registration Range</h5>
            <hr />

            <div className="row">
              <div className="col-md-3">
                <label>Department</label>
                <select
                  className="form-select"
                  value={range.department}
                  onChange={e => onDepartmentChange(e.target.value)}
                >
                  <option value="">Select</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {subjects.length > 0 && (
                <div className="col-md-3">
                  <label>Subject</label>
                  <select
                    className="form-select"
                    value={range.subject}
                    onChange={e => {
                      setRange({ ...range, subject: e.target.value });
                      fetchLastRegNo(range.department, e.target.value);
                    }}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="col-md-2">
                <label>Start Reg No</label>
                <input
                  type="number"
                  className="form-control"
                  value={range.startRegNo}
                  onChange={e =>
                    setRange({ ...range, startRegNo: e.target.value })
                  }
                />
              </div>

              <div className="col-md-2">
                <label>End Reg No</label>
                <input
                  type="number"
                  className="form-control"
                  value={range.endRegNo}
                  onChange={e =>
                    setRange({ ...range, endRegNo: e.target.value })
                  }
                />
              </div>

              <div className="col-md-2 d-flex align-items-end">
                <button className="btn btn-primary w-100" onClick={addRange}>
                  Add
                </button>
              </div>

              {lastRegNo !== null && (
                <div className="col-12 mt-3">
                  <div className="alert alert-info py-2">
                    📌 <strong>Last Used Reg No:</strong> {lastRegNo} |
                    Suggested next start: <strong>{lastRegNo + 1}</strong>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonRangeSetup;
