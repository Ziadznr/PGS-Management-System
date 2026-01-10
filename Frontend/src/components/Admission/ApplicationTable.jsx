import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  SupervisorApplications,
  ChairmanApplications,
  DeanApplications,
  SupervisorDecision,
  ChairmanDecision,
  DeanDecision
} from "../../APIRequest/AdmissionAPIRequest";
import { SetApplications } from "../../redux/state-slice/admission-slice";
import { ErrorToast } from "../../helper/FormHelper";

const ApplicationTable = ({ role }) => {
  const dispatch = useDispatch();
  const applications = useSelector(
    (state) => state.admission.applications
  );

  const [remarks, setRemarks] = useState({});

  // ================= FETCH APPLICATIONS =================
  useEffect(() => {
    const loadData = async () => {
      let data = [];

      if (role === "Supervisor") data = await SupervisorApplications();
      if (role === "Chairman") data = await ChairmanApplications();
      if (role === "Dean") data = await DeanApplications();

      dispatch(SetApplications(data || []));
    };

    loadData();
  }, [role, dispatch]);

  // ================= HANDLE DECISION =================
  const submitDecision = async (appId, decision) => {
    if (!remarks[appId]) {
      return ErrorToast("Remarks required");
    }

    let success = false;

    if (role === "Supervisor") {
      success = await SupervisorDecision(appId, decision, remarks[appId]);
    }
    if (role === "Chairman") {
      success = await ChairmanDecision(appId, decision, remarks[appId]);
    }
    if (role === "Dean") {
      success = await DeanDecision(appId, decision, remarks[appId]);
    }

    if (success) {
      dispatch(
        SetApplications(applications.filter(app => app._id !== appId))
      );
    }
  };

  // ================= UI =================
  return (
    <div className="container mt-4">
      <h4>{role} Admission Panel</h4>

      <div className="table-responsive mt-3">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Program</th>
              <th>Faculty</th>
              <th>Department</th>
              <th>Supervisor</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No Applications Found
                </td>
              </tr>
            ) : (
              applications.map(app => (
                <tr key={app._id}>
                  <td>{app.applicantName}</td>
                  <td>{app.program}</td>
                  <td>{app.faculty?.Name}</td>
                  <td>{app.department?.Name}</td>
                  <td>{app.supervisor?.name || "-"}</td>

                  <td>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Remarks"
                      onChange={(e) =>
                        setRemarks({
                          ...remarks,
                          [app._id]: e.target.value
                        })
                      }
                    />
                  </td>

                  <td>
                    <button
                      className="btn btn-success btn-sm me-1"
                      onClick={() => submitDecision(app._id, "Approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => submitDecision(app._id, "Rejected")}
                    >
                      Reject
                    </button>
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

export default ApplicationTable;
