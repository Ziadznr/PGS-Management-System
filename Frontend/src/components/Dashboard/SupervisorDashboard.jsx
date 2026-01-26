import React, { useEffect, useState } from "react";
import {
  SupervisorApplications,
  SupervisorDecision
} from "../../APIRequest/AdmissionAPIRequest";
import { ErrorToast, SuccessToast } from "../../helper/FormHelper";

// 🔹 NEW: details view
import SupervisorApplicationDetails
  from "../Supervisor/SupervisorApplicationDetails";

const SupervisorDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Selected application for details view
  const [selectedApplication, setSelectedApplication] = useState(null);

  /* ================= LOAD APPLICATIONS ================= */
useEffect(() => {
  const loadApplications = async () => {
    setLoading(true);

    const result = await SupervisorApplications();

    if (result?.status === "success") {
      setApplications(result.data);
    } else {
      setApplications([]);
    }

    setLoading(false);
  };

  loadApplications();
}, []);


  /* ================= APPROVE / REJECT ================= */
  const handleDecision = async (applicationId, decision) => {
    if (!applicationId) return;

    const result = await SupervisorDecision(applicationId, decision);

    if (result) {
      SuccessToast(`Application ${decision}`);
      setApplications(prev =>
        prev.filter(app => app._id !== applicationId)
      );
      setSelectedApplication(null);
    } else {
      ErrorToast("Decision failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container mt-4">
      <h4 className="mb-2">Supervisor Panel</h4>
      <p className="text-muted">
        Applications awaiting your review
      </p>

      {/* 🔹 Loading */}
      {loading && <p>Loading applications...</p>}

      {/* 🔹 Empty */}
      {!loading && applications.length === 0 && (
        <p className="text-muted">No applications found</p>
      )}

      {/* 🔹 Applications Table */}
      {!loading && applications.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Applicant</th>
                <th>Program</th>
                <th>Department</th>
                <th>Mobile</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((app, index) => (
                <tr key={app._id}>
                  <td>{index + 1}</td>
                  <td>{app.applicantName}</td>
                  <td>{app.program}</td>
                  <td>{app.department?.name}</td>
                  <td>{app.mobile}</td>

                  <td className="d-flex gap-2">
                    {/* 🔍 VIEW FULL APPLICATION */}
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedApplication(app)}
                    >
                      View
                    </button>

                    {/* ✅ APPROVE */}
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() =>
                        handleDecision(app._id, "Approve")
                      }
                    >
                      Approve
                    </button>

                    {/* ❌ REJECT */}
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

      {/* 🔹 FULL APPLICATION DETAILS MODAL */}
      {selectedApplication && (
        <SupervisorApplicationDetails
          app={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  );
};

export default SupervisorDashboard;
