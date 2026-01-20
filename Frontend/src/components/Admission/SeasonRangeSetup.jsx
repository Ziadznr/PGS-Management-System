import React, { useEffect, useState } from "react";
import {
  CreateAdmissionSeasonRequest,
  AdmissionSeasonListRequest,
  SetDepartmentRegistrationRangeRequest
} from "../../APIRequest/AdmissionAPIRequest";
import { DepartmentDropdownRequest } from "../../APIRequest/UserAPIRequest";
import { ErrorToast, IsEmpty, SuccessToast } from "../../helper/FormHelper";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const SeasonRangeSetup = () => {
  const navigate = useNavigate();

  // ================= STATE =================
  const [seasonId, setSeasonId] = useState("");
  const [seasons, setSeasons] = useState([]);

  const [season, setSeason] = useState({
    seasonName: "",
    academicYear: "",
    applicationStartDate: "",
    applicationEndDate: ""
  });

  const [range, setRange] = useState({
    department: "",
    startRegNo: "",
    endRegNo: ""
  });

  const [departments, setDepartments] = useState([]);
  // const [rangeList, setRangeList] = useState([]);

  // ================= LOAD DATA =================
  useEffect(() => {
    (async () => {
      const d = await DepartmentDropdownRequest();
      const s = await AdmissionSeasonListRequest();

      if (Array.isArray(d)) setDepartments(d);
      if (Array.isArray(s)) setSeasons(s);
    })();
  }, []);

  // ================= CREATE SEASON =================
  const createSeason = async () => {
    const {
      seasonName,
      academicYear,
      applicationStartDate,
      applicationEndDate
    } = season;

    if (
      IsEmpty(seasonName) ||
      IsEmpty(academicYear) ||
      IsEmpty(applicationStartDate) ||
      IsEmpty(applicationEndDate)
    ) {
      ErrorToast("All fields are required");
      return;
    }

    if (applicationStartDate > applicationEndDate) {
      ErrorToast("Start date must be before end date");
      return;
    }

    const confirm = await Swal.fire({
      title: "Create Admission Season?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Create"
    });

    if (!confirm.isConfirmed) return;

    const res = await CreateAdmissionSeasonRequest(season);

    if (res?._id) {
      SuccessToast("Season Created");

      setSeasonId(res._id);
      setSeasons(prev => [...prev, res]);

      // reset form
      setSeason({
        seasonName: "",
        academicYear: "",
        applicationStartDate: "",
        applicationEndDate: ""
      });
    }
  };

  // ================= ADD RANGE =================
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

    if (Number(range.startRegNo) >= Number(range.endRegNo)) {
      ErrorToast("End Reg No must be greater than Start");
      return;
    }

    const payload = {
      admissionSeason: seasonId,
      department: range.department,
      startRegNo: Number(range.startRegNo),
      endRegNo: Number(range.endRegNo)
    };

    const success = await SetDepartmentRegistrationRangeRequest(payload);

    if (success) {
      setRange({ department: "", startRegNo: "", endRegNo: "" });

      const next = await Swal.fire({
        title: "Range Added",
        text: "Add more ranges?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "Go to Department Ranges"
      });

      if (!next.isConfirmed) {
        navigate("/admission-seasons");
      }
    }
  };

  // ================= UI =================
  return (
    <div className="container-fluid my-4">

      {/* ================= SELECT EXISTING SEASON ================= */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>Select Existing Admission Season</h5>
          <select
            className="form-select mt-2"
            value={seasonId}
            onChange={(e) => setSeasonId(e.target.value)}
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

      {/* ================= CREATE NEW SEASON ================= */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>Create New Admission Season</h5>
          <hr />

          <div className="row">
            <div className="col-md-3">
              <label>Season Name</label>
              <select
                className="form-select"
                value={season.seasonName}
                onChange={(e) =>
                  setSeason({ ...season, seasonName: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="January-June">January-June</option>
                <option value="July-December">July-December</option>
              </select>
            </div>

            <div className="col-md-3">
              <label>Academic Year</label>
              <input
                className="form-control"
                value={season.academicYear}
                onChange={(e) =>
                  setSeason({ ...season, academicYear: e.target.value })
                }
              />
            </div>

            <div className="col-md-3">
              <label>Application Start</label>
              <input
                type="date"
                className="form-control"
                value={season.applicationStartDate}
                onChange={(e) =>
                  setSeason({ ...season, applicationStartDate: e.target.value })
                }
              />
            </div>

            <div className="col-md-3">
              <label>Application End</label>
              <input
                type="date"
                className="form-control"
                value={season.applicationEndDate}
                onChange={(e) =>
                  setSeason({ ...season, applicationEndDate: e.target.value })
                }
              />
            </div>
          </div>

          <button className="btn btn-success mt-3" onClick={createSeason}>
            Create Season
          </button>
        </div>
      </div>

      {/* ================= RANGE SETUP ================= */}
      {seasonId && (
        <div className="card">
          <div className="card-body">
            <h5>Department Registration Ranges</h5>
            <hr />

            <div className="row">
              <div className="col-md-4">
                <label>Department</label>
                <select
                  className="form-select"
                  value={range.department}
                  onChange={(e) =>
                    setRange({ ...range, department: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label>Start Reg No</label>
                <input
                  type="number"
                  className="form-control"
                  value={range.startRegNo}
                  onChange={(e) =>
                    setRange({ ...range, startRegNo: e.target.value })
                  }
                />
              </div>

              <div className="col-md-3">
                <label>End Reg No</label>
                <input
                  type="number"
                  className="form-control"
                  value={range.endRegNo}
                  onChange={(e) =>
                    setRange({ ...range, endRegNo: e.target.value })
                  }
                />
              </div>

              <div className="col-md-2 d-flex align-items-end">
                <button className="btn btn-primary w-100" onClick={addRange}>
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SeasonRangeSetup;
