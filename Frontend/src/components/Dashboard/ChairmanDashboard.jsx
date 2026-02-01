import React, { useEffect, useState } from "react";
import {
  ChairmanApplications,
  ChairmanDecision,
  ChairmanManualSelect
} from "../../APIRequest/AdmissionAPIRequest";
import { ErrorToast, SuccessToast } from "../../helper/FormHelper";
import SupervisorApplicationDetails
  from "../Supervisor/SupervisorApplicationDetails";

const AUTO_QUOTA = 3;
const MAX_QUOTA = 5;

const ChairmanDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
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
    const supName = app.supervisor?.name || "Unknown Supervisor";
    if (!acc[supName]) acc[supName] = [];
    acc[supName].push(app);
    return acc;
  }, {});

  /* ================= RUN MERIT ================= */
  const handleMeritProcess = async () => {
    setProcessing(true);
    const ok = await ChairmanDecision();
    setProcessing(false);

    if (ok) {
      SuccessToast("Merit processed successfully");
      await loadApplications();
    } else {
      ErrorToast("Merit processing failed");
    }
  };

  /* ================= MANUAL SELECT ================= */
  const handleManualSelect = async (applicationId) => {
    const confirm = window.confirm(
      "Are you sure you want to select this applicant?"
    );
    if (!confirm) return;

    const ok = await ChairmanManualSelect(applicationId);

    if (ok) {
      SuccessToast("Applicant selected successfully");
      await loadApplications();
    } else {
      ErrorToast("Manual selection failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container mt-4">
      <h4 className="mb-2">🏛 Chairman Panel</h4>
      <p className="text-muted">
        Top {AUTO_QUOTA} auto selected. Rank {AUTO_QUOTA + 1}–{MAX_QUOTA} can be manually selected.
      </p>

      {/* ===== RUN MERIT BUTTON ===== */}
      <button
        className="btn btn-primary mb-3"
        onClick={handleMeritProcess}
        disabled={processing}
      >
        {processing ? "Processing..." : "Run Merit Selection"}
      </button>

      {loading && <p>Loading applications...</p>}

      {!loading &&
        Object.entries(groupedBySupervisor).map(
          ([supervisorName, apps], idx) => {

            const selectedCount = apps.filter(
              a => a.applicationStatus === "ChairmanSelected"
            ).length;

            return (
              <div key={idx} className="mb-4">
                <h6 className="fw-bold mb-2">
                  Supervisor: {supervisorName}
                </h6>

                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Applicant</th>
                        <th>Program</th>
                        <th>Merit</th>
                        <th>Rank</th>
                        <th>Status</th>
                        <th>Extra Select</th>
                        <th style={{ width: 90 }}>View</th>
                      </tr>
                    </thead>

                    <tbody>
                      {apps.map(app => {
                        const rank = app.supervisorRank;

                        const isExtraEligible =
  app.applicationStatus === "ChairmanWaiting" &&
  rank > AUTO_QUOTA &&
  rank <= MAX_QUOTA;

                        return (
                          <tr key={app._id}>
                            <td>{rank}</td>
                            <td>{app.applicantName}</td>
                            <td>{app.program}</td>
                            <td>{app.academicQualificationPoints}</td>
                            <td>{rank}</td>

                            {/* ===== STATUS ===== */}
                            <td>
                              <span
                                className={`badge ${
                                  app.applicationStatus === "ChairmanSelected"
                                    ? "bg-success"
                                    : "bg-warning"
                                }`}
                              >
                                {app.applicationStatus === "ChairmanSelected"
                                  ? "Auto Selected"
                                  : "Waiting"}
                              </span>
                            </td>

                            {/* ===== EXTRA SELECT ===== */}
                            <td className="text-center">
                              {isExtraEligible ? (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() =>
                                    handleManualSelect(app._id)
                                  }
                                >
                                  Select
                                </button>
                              ) : (
                                "—"
                              )}
                            </td>

                            {/* ===== VIEW ===== */}
                            <td className="text-center">
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() => setSelectedApp(app)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <small className="text-muted">
                  Selected: {selectedCount} / {MAX_QUOTA}
                </small>

                {/* ===== DETAILS MODAL ===== */}
                {selectedApp && (
                  <SupervisorApplicationDetails
                    app={selectedApp}
                    onClose={() => setSelectedApp(null)}
                  />
                )}
              </div>
            );
          }
        )}
    </div>
  );
};

export default ChairmanDashboard;
