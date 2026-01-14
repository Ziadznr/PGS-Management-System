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

  const loadAllRanges = async () => {
    const data = await GetAllDepartmentRangesRequest();

    const grouped = data.reduce((acc, item) => {
      const sid = item.admissionSeason._id;
      if (!acc[sid]) {
        acc[sid] = {
          season: item.admissionSeason,
          ranges: []
        };
      }
      acc[sid].ranges.push(item);
      return acc;
    }, {});

    setGroupedData(grouped);
  };

  const toggleSeasonView = (id) =>
    setCollapsed(p => ({ ...p, [id]: !p[id] }));

  const toggleLock = async (seasonId) => {
    const confirm = await Swal.fire({
      title: "Toggle Lock?",
      text: "This will enable/disable editing for this season",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes"
    });

    if (!confirm.isConfirmed) return;

    const success = await ToggleSeasonLockRequest(seasonId);
    if (success) loadAllRanges();
  };

  const updateRange = async (range) => {
    const { value } = await Swal.fire({
      title: "Update Range",
      html: `
        <input id="start" class="swal2-input" value="${range.startRegNo}">
        <input id="end" class="swal2-input" value="${range.endRegNo}">
      `,
      preConfirm: () => {
        const start = Number(document.getElementById("start").value);
        const end = Number(document.getElementById("end").value);
        if (!start || !end || start >= end) {
          Swal.showValidationMessage("Invalid range");
          return false;
        }
        return { startRegNo: start, endRegNo: end };
      },
      showCancelButton: true
    });

    if (!value) return;

    await SetDepartmentRegistrationRangeRequest({
      id: range._id,
      admissionSeason: range.admissionSeason._id,
      department: range.department._id,
      ...value
    });

    loadAllRanges();
  };

  const deleteRange = async (id) => {
    const ok = await DeleteDepartmentRangeRequest(id);
    if (ok) loadAllRanges();
  };

  return (
    <div className="container-fluid my-4">

      {Object.values(groupedData).map(({ season, ranges }) => (
        <div key={season._id} className="card mb-4">

          {/* HEADER */}
          <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
            <div>
              <h5 className="mb-0">
                {season.seasonName} ({season.academicYear})
              </h5>
              {season.isLocked && (
                <span className="badge bg-danger">LOCKED</span>
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
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Department</th>
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
                      <td>{r.department.name}</td>
                      <td>{r.startRegNo}</td>
                      <td>{r.endRegNo}</td>
                      <td>{r.currentRegNo}</td>
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
