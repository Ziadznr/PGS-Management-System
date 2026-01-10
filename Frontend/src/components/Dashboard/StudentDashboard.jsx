import React, { useEffect, useState } from "react";
import { StudentApplicationStatus } from "../../APIRequest/AdmissionAPIRequest";

const StudentDashboard = () => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      const result = await StudentApplicationStatus();
      setApplication(result);
      setLoading(false);
    };
    loadStatus();
  }, []);

  if (loading) {
    return <p className="text-center mt-4">Loading admission status...</p>;
  }

  if (!application) {
    return (
      <div className="container mt-4">
        <h4>My Admission Status</h4>
        <p className="text-muted mt-3">
          You have not submitted any admission application yet.
        </p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h4 className="mb-3">My Admission Status</h4>

      <div className="card shadow-sm">
        <div className="card-body">

          <p><strong>Application No:</strong> {application.applicationNo}</p>
          <p><strong>Program:</strong> {application.program}</p>
          <p><strong>Faculty:</strong> {application.faculty?.Name}</p>
          <p><strong>Department:</strong> {application.department?.Name}</p>

          <hr />

          <ul className="list-group">
            <li className="list-group-item">
              <strong>Application:</strong> Submitted ✅
            </li>

            <li className="list-group-item">
              <strong>Supervisor:</strong>{" "}
              {application.supervisorDecision || "Pending"}
            </li>

            <li className="list-group-item">
              <strong>Chairman:</strong>{" "}
              {application.chairmanDecision || "Pending"}
            </li>

            <li className="list-group-item">
              <strong>Dean:</strong>{" "}
              {application.deanDecision || "Pending"}
            </li>

            <li className="list-group-item">
              <strong>Final Status:</strong>{" "}
              <span
                className={
                  application.applicationStatus === "Selected"
                    ? "text-success"
                    : application.applicationStatus === "Rejected"
                    ? "text-danger"
                    : "text-warning"
                }
              >
                {application.applicationStatus}
              </span>
            </li>
          </ul>

          {/* Final approval message */}
          {application.applicationStatus === "Selected" && (
            <div className="alert alert-success mt-3">
              🎉 <strong>Congratulations!</strong>  
              <br />
              Your admission has been finalized.  
              You will receive your temporary login credentials shortly.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
