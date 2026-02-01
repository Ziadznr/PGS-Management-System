import React, { useEffect, useState } from "react";
import { AdminTenureListRequest } from "../../APIRequest/AdminAPIRequest";

const AdminTenureList = () => {
  const [tenures, setTenures] = useState([]);
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    AdminTenureListRequest().then(res => {
      if (Array.isArray(res)) {
        setTenures(res);
      }
    });
  }, []);

  const filtered = tenures.filter(t => {
    if (role !== "All" && t.role !== role) return false;
    if (status === "Active" && t.endDate) return false;
    if (status === "Ended" && !t.endDate) return false;
    return true;
  });

  return (
    <div className="container mt-4">
      <h4>🏛 Tenure History</h4>

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
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Start</th>
            <th>End</th>
          </tr>
        </thead>

        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center text-muted">
                No tenure records found
              </td>
            </tr>
          ) : (
            filtered.map((t, i) => (
              <tr key={t._id}>
                <td>{i + 1}</td>

                {/* ✅ SNAPSHOT NAME */}
                <td>{t.nameSnapshot || "—"}</td>

                {/* ✅ SNAPSHOT EMAIL */}
                <td>{t.emailSnapshot || "—"}</td>

                <td>{t.role}</td>
                <td>{t.department?.name || "—"}</td>
                <td>{new Date(t.startDate).toDateString()}</td>
                <td>
                  {t.endDate ? (
                    new Date(t.endDate).toDateString()
                  ) : (
                    <span className="badge bg-success">Active</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTenureList;
