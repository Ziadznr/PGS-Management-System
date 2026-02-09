import React, { useEffect, useState } from "react";
import { AdminTenureListRequest } from "../../APIRequest/AdminAPIRequest";

const AdminTenureList = () => {
  const [tenures, setTenures] = useState([]);
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    (async () => {
      const res = await AdminTenureListRequest();
      if (Array.isArray(res)) {
        setTenures(res);
      }
    })();
  }, []);

  /* ================= FILTER ================= */
  const filtered = tenures.filter(t => {
    if (role !== "All" && t.role !== role) return false;
    if (status === "Active" && t.endDate) return false;
    if (status === "Ended" && !t.endDate) return false;
    return true;
  });

  return (
    <div className="container mt-4">

      <h4 className="mb-3">🏛 Tenure History</h4>

      {/* ================= FILTERS ================= */}
      <div className="row mb-3">
        <div className="col-md-3">
          <select
            className="form-select"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Dean">Dean</option>
            <option value="VC">VC</option>
            <option value="Registrar">Registrar</option>
            <option value="PGS Specialist">PGS Specialist</option>
            <option value="Chairman">Chairman</option>
            <option value="Provost">Provost</option>
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Ended">Ended</option>
          </select>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department / Hall</th>
              <th>Start Date</th>
              <th>End Date</th>
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

                  {/* SNAPSHOT NAME */}
                  <td>{t.nameSnapshot || "—"}</td>

                  {/* SNAPSHOT EMAIL */}
                  <td>{t.emailSnapshot || "—"}</td>

                  <td>{t.role}</td>

                  {/* DEPARTMENT / HALL */}
                  <td>
                    {t.department?.name ||
                     t.hall?.name ||
                     "—"}
                  </td>

                  <td>
                    {t.startDate
                      ? new Date(t.startDate).toLocaleDateString()
                      : "—"}
                  </td>

                  <td>
                    {t.endDate ? (
                      new Date(t.endDate).toLocaleDateString()
                    ) : (
                      <span className="badge bg-success">
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminTenureList;
