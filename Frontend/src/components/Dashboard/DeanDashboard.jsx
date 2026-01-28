import React, { useEffect, useState } from "react";
import {
  DeanApplications,
  DeanDecision
} from "../../APIRequest/AdmissionAPIRequest";
import { ErrorToast, SuccessToast } from "../../helper/FormHelper";
import SupervisorApplicationDetails from "../Supervisor/SupervisorApplicationDetails";

const DeanDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  /* ================= LOAD APPLICATIONS ================= */
  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);

      const result = await DeanApplications();
      setApplications(Array.isArray(result) ? result : []);

      setLoading(false);
    };

    loadApplications();
  }, []);

  /* ================= FINAL DECISION ================= */
  const handleDecision = async (applicationId, decision) => {
    if (!applicationId) return;

    const ok = await DeanDecision(applicationId, decision);

    if (ok) {
      SuccessToast(
        decision === "Approve"
          ? "Application approved successfully"
          : "Application rejected"
      );

      setApplications(prev =>
        prev.filter(app => app._id !== applicationId)
      );

      setSelectedApp(null);
    } else {
      ErrorToast("Decision failed");
    }
  };

  /* ================= STATUS BADGE ================= */
  const getStatusBadge = (status) => {
    switch (status) {
      case "ChairmanSelected":
        return "bg-primary";
      case "DeanAccepted":
        return "bg-success";
      case "DeanRejected":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container mt-4">
      <h4 className="mb-2">Dean Panel</h4>
      <p className="text-muted">
        Final approval of chairman-selected applications
      </p>

      {loading && <p>Loading applications...</p>}

      {!loading && applications.length === 0 && (
        <p className="text-muted">No applications pending</p>
      )}

      {!loading && applications.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Applicant</th>
                <th>Program</th>
                <th>Department</th>
                <th>Supervisor</th>
                <th>Chairman</th>
                <th>Mobile</th>
                <th>Merit Point</th>
                <th>Rank</th>
                <th>Status</th>
                <th style={{ width: 220 }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((app, index) => (
                <tr key={app._id}>
                  <td>{index + 1}</td>
                  <td>{app.applicantName}</td>
                  <td>{app.program}</td>
                  <td>{app.departmentName}</td>
                  <td>{app.supervisorName}</td>
                  <td>{app.chairmanName}</td>
                  <td>{app.mobile}</td>
                  <td>{app.academicQualificationPoints}</td>
                  <td>{app.supervisorRank}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(app.applicationStatus)}`}>
                      {app.applicationStatus}
                    </span>
                  </td>

                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => setSelectedApp(app.fullApplication)}
                    >
                      View
                    </button>

                    <button
                      className="btn btn-success btn-sm"
                      onClick={() =>
                        handleDecision(app._id, "Approve")
                      }
                    >
                      Approve
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDecision(app._id, "Reject")
                      }
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= APPLICATION DETAILS MODAL ================= */}
      {selectedApp && (
        <SupervisorApplicationDetails
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
};

export default DeanDashboard;
