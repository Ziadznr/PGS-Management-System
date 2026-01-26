import React, { useEffect, useState } from "react";
import {
  GetAllDepartmentRangesRequest,
  SetDepartmentRegistrationRangeRequest,
  DeleteDepartmentRangeRequest,
  ToggleSeasonLockRequest
} from "../../APIRequest/AdmissionAPIRequest";
import Swal from "sweetalert2";

const DepartmentRangeList = () => {
  const [groupedData, setGroupedData] = useState({});
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    loadAllRanges();
  }, []);

  /* ================= LOAD & GROUP DATA ================= */
  const loadAllRanges = async () => {
    const data = await GetAllDepartmentRangesRequest();

    if (!Array.isArray(data)) {
      setGroupedData({});
      return;
    }

    const grouped = data.reduce((acc, item) => {
      if (!item?.admissionSeason || !item?.department) return acc;

      const seasonId = item.admissionSeason._id;

      if (!acc[seasonId]) {
        acc[seasonId] = {
          season: item.admissionSeason,
          ranges: []
        };
      }

      acc[seasonId].ranges.push(item);
      return acc;
    }, {});

    setGroupedData(grouped);
  };

  /* ================= UI HELPERS ================= */
  const toggleSeasonView = (id) =>
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  /* ================= LOCK / UNLOCK ================= */
  const toggleLock = async (seasonId) => {
    const confirm = await Swal.fire({
      title: "Toggle Lock?",
      text: "This will enable or disable editing for this season",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes"
    });

    if (!confirm.isConfirmed) return;

    const success = await ToggleSeasonLockRequest(seasonId);
    if (success) loadAllRanges();
  };

  /* ================= UPDATE RANGE ================= */
  const updateRange = async (range) => {
    if (!range?.admissionSeason || !range?.department) {
      Swal.fire("Error", "Invalid range data", "error");
      return;
    }

    const { value } = await Swal.fire({
      title: "Update Registration Range",
      html: `
        <input id="start" class="swal2-input" placeholder="Start Reg No" value="${range.startRegNo}">
        <input id="end" class="swal2-input" placeholder="End Reg No" value="${range.endRegNo}">
      `,
      showCancelButton: true,
      preConfirm: () => {
        const start = Number(document.getElementById("start").value);
        const end = Number(document.getElementById("end").value);

        if (!start || !end || start >= end) {
          Swal.showValidationMessage("Invalid registration range");
          return false;
        }

        return { startRegNo: start, endRegNo: end };
      }
    });

    if (!value) return;

    await SetDepartmentRegistrationRangeRequest({
      id: range._id,
      admissionSeason: range.admissionSeason._id,
      department: range.department._id,
      subjectId: range.subjectId || null, // ✅ keep subject unchanged
      ...value
    });

    loadAllRanges();
  };

  /* ================= DELETE RANGE ================= */
  const deleteRange = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete this range?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete"
    });

    if (!confirm.isConfirmed) return;

    const ok = await DeleteDepartmentRangeRequest(id);
    if (ok) loadAllRanges();
  };

  /* ================= RENDER ================= */
  return (
    <div className="container-fluid my-4">

      {Object.values(groupedData).length === 0 && (
        <div className="alert alert-info text-center">
          No department registration ranges found
        </div>
      )}

      {Object.values(groupedData).map(({ season, ranges }) => (
        <div key={season._id} className="card mb-4">

          {/* HEADER */}
          <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
            <div>
              <h5 className="mb-0">
                {season.seasonName} ({season.academicYear})
              </h5>
              {season.isLocked && (
                <span className="badge bg-danger ms-2">LOCKED</span>
              )}
            </div>

            <div>
              <button
                className={`btn btn-sm ${
                  season.isLocked ? "btn-success" : "btn-warning"
                } me-2`}
                onClick={() => toggleLock(season._id)}
              >
                {season.isLocked ? "Unlock" : "Lock"}
              </button>

              <button
                className="btn btn-light btn-sm"
                onClick={() => toggleSeasonView(season._id)}
              >
                {collapsed[season._id] ? "Expand" : "Collapse"}
              </button>
            </div>
          </div>

          {/* BODY */}
          {!collapsed[season._id] && (
            <div className="card-body">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>No</th>
                    <th>Department</th>
                    <th>Subject</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Current</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {ranges.map((r, i) => (
                    <tr key={r._id}>
                      <td>{i + 1}</td>
                      <td>{r.department?.name || "N/A"}</td>
                      <td>
  {r.subjectName ? (
    <span className="badge bg-info text-dark">
      {r.subjectName}
    </span>
  ) : (
    <span className="text-muted">—</span>
  )}
</td>

                      <td>{r.startRegNo}</td>
                      <td>{r.endRegNo}</td>
                      <td>{r.currentRegNo ?? "—"}</td>
                      <td>
                        <button
                          disabled={season.isLocked}
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => updateRange(r)}
                        >
                          Edit
                        </button>
                        <button
                          disabled={season.isLocked}
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteRange(r._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      ))}
    </div>
  );
};

export default DepartmentRangeList;
