import React, { useEffect, useState } from "react";
import { AdminTenureListRequest } from "../../APIRequest/AdminAPIRequest";

const AdminTenureList = () => {
  const [tenures, setTenures] = useState([]);
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    AdminTenureListRequest().then(setTenures);
  }, []);

  const filtered = tenures.filter(t => {
    if (role !== "All" && t.role !== role) return false;
    if (status === "Active" && t.endDate) return false;
    if (status === "Ended" && !t.endDate) return false;
    return true;
  });

  return (
    <div className="container mt-4">
      <h4>🏛 Tenure History </h4>

      {/* FILTERS */}
      <div className="row mb-3">
        <div className="col-3">
          <select
            className="form-select"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Dean">Dean</option>
            <option value="Chairman">Chairman</option>
          </select>
        </div>

        <div className="col-3">
          <select
            className="form-select"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Ended">Ended</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Role</th>
            <th>Department</th>
            <th>Start</th>
            <th>End</th>
            {/* <th>Appointed By</th> */}
          </tr>
        </thead>

        <tbody>
          {filtered.map((t, i) => (
            <tr key={t._id}>
              <td>{i + 1}</td>
              <td>{t.user?.name}</td>
              <td>{t.role}</td>
              <td>{t.department?.name || "—"}</td>
              <td>{new Date(t.startDate).toDateString()}</td>
              <td>
                {t.endDate
                  ? new Date(t.endDate).toDateString()
                  : <span className="badge bg-success">Active</span>}
              </td>
              {/* <td>{t.appointedBy?.name}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTenureList;
