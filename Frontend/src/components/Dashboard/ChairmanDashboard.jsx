import React, { useEffect, useState } from "react";
import {
  ChairmanApplications,
  ChairmanDecision
} from "../../APIRequest/AdmissionAPIRequest";
import { ErrorToast, SuccessToast } from "../../helper/FormHelper";

const ChairmanDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Load chairman applications
  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      const result = await ChairmanApplications();
      if (Array.isArray(result)) {
        setApplications(result);
      } else {
        setApplications([]);
      }
      setLoading(false);
    };
    loadApplications();
  }, []);

  // 🔹 Approve / Reject
  const handleDecision = async (applicationId, decision) => {
    if (!applicationId) return;

    const result = await ChairmanDecision(applicationId, decision);

    if (result) {
      SuccessToast(`Application ${decision}`);
      setApplications((prev) =>
        prev.filter((app) => app._id !== applicationId)
      );
    } else {
      ErrorToast("Decision failed");
    }
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Chairman Panel</h4>
      <p className="text-muted">Applications approved by supervisors</p>

      {/* Loading */}
      {loading && <p>Loading applications...</p>}

      {/* Empty */}
      {!loading && applications.length === 0 && (
        <p className="text-muted">No applications found</p>
      )}

      {/* Table */}
      {!loading && applications.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Applicant</th>
                <th>Program</th>
                <th>Faculty</th>
                <th>Department</th>
                <th>Supervisor</th>
                <th>Mobile</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr key={app._id}>
                  <td>{index + 1}</td>
                  <td>{app.applicantName}</td>
                  <td>{app.program}</td>
                  <td>{app.faculty?.Name}</td>
                  <td>{app.department?.Name}</td>
                  <td>{app.supervisor?.CustomerName || "-"}</td>
                  <td>{app.mobile}</td>
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() =>
                        handleDecision(app._id, "Approved")
                      }
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDecision(app._id, "Rejected")
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
    </div>
  );
};

export default ChairmanDashboard;
