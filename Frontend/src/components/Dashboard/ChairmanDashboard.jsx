import React, { useEffect, useState } from "react";
import {
  ChairmanApplications,
  ChairmanDecision
} from "../../APIRequest/AdmissionAPIRequest";
import { ErrorToast, SuccessToast } from "../../helper/FormHelper";

const ChairmanDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  /* ================= LOAD APPLICATIONS ================= */
  const loadApplications = async () => {
    setLoading(true);
    const result = await ChairmanApplications();
    setApplications(Array.isArray(result) ? result : []);
    setLoading(false);
  };

  useEffect(() => {
    loadApplications();
  }, []);

  /* ================= GROUP BY SUPERVISOR ================= */
  const groupedBySupervisor = applications.reduce((acc, app) => {
    const supName = app.supervisor || "Unknown Supervisor";
    if (!acc[supName]) acc[supName] = [];
    acc[supName].push(app);
    return acc;
  }, {});

  /* ================= RUN MERIT PROCESS ================= */
  const handleMeritProcess = async () => {
    setProcessing(true);
    const ok = await ChairmanDecision();
    setProcessing(false);

    if (ok) {
      SuccessToast("Merit selection completed successfully");
      await loadApplications();
    } else {
      ErrorToast("Merit processing failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container mt-4">
      <h4 className="mb-2">Chairman Panel</h4>
      <p className="text-muted">
        Supervisor-wise merit list (Top 10 per supervisor auto selected)
      </p>

      {/* 🔘 RUN MERIT BUTTON */}
      <button
        className="btn btn-primary mb-3"
        onClick={handleMeritProcess}
        disabled={processing}
      >
        {processing
          ? "Processing Merit List..."
          : "Run Merit Selection"}
      </button>

      {/* Loading */}
      {loading && <p>Loading applications...</p>}

      {/* Empty */}
      {!loading && applications.length === 0 && (
        <p className="text-muted">No applications found</p>
      )}

      {/* Supervisor-wise Tables */}
      {!loading &&
        Object.entries(groupedBySupervisor).map(
          ([supervisorName, apps], idx) => (
            <div key={idx} className="mb-4">
              <h6 className="fw-bold mb-2">
                Supervisor: {supervisorName}
              </h6>

              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Applicant</th>
                      <th>Program</th>
                      <th>Mobile</th>
                      <th>Merit Points</th>
                      <th>Rank</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {apps.map((app, index) => {
                      const status =
                        app.previewStatus || app.applicationStatus;

                      const isSelected =
                        status === "ChairmanSelected";

                      return (
                        <tr key={app._id}>
                          <td>{index + 1}</td>
                          <td>{app.applicantName}</td>
                          <td>{app.program}</td>
                          <td>{app.mobile}</td>
                          <td>{app.academicQualificationPoints || 0}</td>
                          <td>{app.supervisorRank}</td>
                          <td>
                            <span
                              className={`badge ${
                                isSelected
                                  ? "bg-success"
                                  : "bg-warning"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
    </div>
  );
};

export default ChairmanDashboard;
