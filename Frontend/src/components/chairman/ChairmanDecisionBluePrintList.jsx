import React, { useEffect, useState } from "react";
import {
  ChairmanDecisionBlueprintListRequest
} from "../../APIRequest/UserAPIRequest";
import SupervisorApplicationDetails
  from "../Supervisor/SupervisorApplicationDetails";

const ChairmanDecisionBlueprintList = () => {
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  /* ================= LOAD BLUEPRINTS ================= */
  useEffect(() => {
    const loadBlueprints = async () => {
      setLoading(true);
      const result =
        await ChairmanDecisionBlueprintListRequest();

      setBlueprints(Array.isArray(result) ? result : []);
      setLoading(false);
    };

    loadBlueprints();
  }, []);

  return (
    <div className="container mt-4">
      <h4 className="mb-1">📘 Chairman Decision Blueprints</h4>
      <p className="text-muted">
        Merit snapshots (auto-deleted after 10 days)
      </p>

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="alert alert-info">
          Loading decision blueprints…
        </div>
      )}

      {/* ================= EMPTY ================= */}
      {!loading && blueprints.length === 0 && (
        <div className="alert alert-secondary">
          No decision blueprints available
        </div>
      )}

      {/* ================= LIST ================= */}
      {!loading &&
        blueprints.map((bp) => (
          <div key={bp._id} className="card mb-4 shadow-sm">
            <div className="card-header bg-light">
              <strong>Supervisor:</strong>{" "}
              {bp.supervisor?.name || "Unknown"}

              <span className="float-end text-muted">
                {new Date(bp.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-bordered mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Applicant</th>
                      <th>Program</th>
                      <th>Merit</th>
                      <th>Rank</th>
                      <th>Status</th>
                      <th className="text-center" style={{ width: 90 }}>
                        View
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {bp.applications.map((app, index) => (
                      <tr key={app.applicationId}>
                        <td>{index + 1}</td>
                        <td>{app.applicantName}</td>
                        <td>{app.program}</td>
                        <td>{app.meritPoint}</td>
                        <td>{app.rank}</td>
                        <td>
                          <span
                            className={`badge ${
                              app.status === "Selected"
                                ? "bg-success"
                                : "bg-warning"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-outline-info btn-sm"
                            onClick={() =>
                              setSelectedApp({
                                _id: app.applicationId
                              })
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}

      {/* ================= DETAILS MODAL ================= */}
      {selectedApp && (
        <SupervisorApplicationDetails
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
};

export default ChairmanDecisionBlueprintList;
