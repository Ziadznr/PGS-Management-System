import React, { useEffect, useState } from "react";
import CountUp from "react-countup";
import { FaUserTie, FaUsers, FaChalkboardTeacher } from "react-icons/fa";
import { Card } from "react-bootstrap";
import store from "../../redux/store/store";
import { ShowLoader, HideLoader } from "../../redux/state-slice/settings-slice";
import axios from "axios";
import { BaseURL } from "../../helper/config";
import { getAdminToken } from "../../helper/SessionHelper";

// ---------------- Axios Header ----------------
const getAxiosHeader = () => ({
  headers: { token: getAdminToken() }
});

const AdminDashboard = () => {
  const [dean, setDean] = useState(null);
  const [chairmanCount, setChairmanCount] = useState(0);
  const [supervisorCount, setSupervisorCount] = useState(0);
  const [deptEnrollments, setDeptEnrollments] = useState([]);

 useEffect(() => {
  const loadDashboardData = async () => {
    store.dispatch(ShowLoader());
    try {
      const [deanRes, chairmanRes, supervisorRes, enrollmentRes] =
        await Promise.all([
          axios.get(
            `${BaseURL}/admin/users/list/1/1/0/Dean`,
            getAxiosHeader()
          ),
          axios.get(
            `${BaseURL}/admin/users/list/1/1000/0/Chairman`,
            getAxiosHeader()
          ),
          axios.get(
            `${BaseURL}/admin/users/list/1/1000/0/Supervisor`,
            getAxiosHeader()
          ),
          axios.get(
            `${BaseURL}/admission/enrollment/summary`,
            getAxiosHeader()
          )
        ]);

      setDean(deanRes.data?.data?.[0]?.Rows?.[0] || null);

      setChairmanCount(
  chairmanRes.data?.data?.[0]?.Total?.[0]?.count || 0
);

setSupervisorCount(
  supervisorRes.data?.data?.[0]?.Total?.[0]?.count || 0
);


      setDeptEnrollments(enrollmentRes.data?.data || []);

    } finally {
      store.dispatch(HideLoader());
    }
  };

  loadDashboardData();
}, []);

  return (
    <div className="container-fluid mt-4">

      {/* ================= TOP CARDS ================= */}
      <div className="row">

  {/* Dean */}
  <div className="col-md-4 mb-3">
    <Card className="shadow-sm border-0">
      <Card.Body className="d-flex align-items-center">
        <div className="me-3 text-primary">
          <FaUserTie size={40} />
        </div>
        <div>
          <h6 className="text-muted mb-1">Dean (PGS)</h6>
          {dean ? (
            <>
              <h5 className="mb-0">{dean.name}</h5>
              <small>{dean.email}</small>
            </>
          ) : (
            <span className="text-muted">Not Assigned</span>
          )}
        </div>
      </Card.Body>
    </Card>
  </div>

  {/* Chairman Count */}
  <div className="col-md-4 mb-3">
    <Card className="shadow-sm border-0">
      <Card.Body className="d-flex align-items-center">
        <div className="me-3 text-success">
          <FaUsers size={40} />
        </div>
        <div>
          <h6 className="text-muted mb-1">Total Chairmen</h6>
          <h2 className="mb-0 text-success">
            <CountUp end={chairmanCount} duration={1.5} />
          </h2>
        </div>
      </Card.Body>
    </Card>
  </div>

  {/* Supervisor Count */}
  <div className="col-md-4 mb-3">
    <Card className="shadow-sm border-0">
      <Card.Body className="d-flex align-items-center">
        <div className="me-3 text-purple">
          <FaChalkboardTeacher size={40} />
        </div>
        <div>
          <h6 className="text-muted mb-1">Total Supervisors</h6>
          <h2 className="mb-0" style={{ color: "#6f42c1" }}>
            <CountUp end={supervisorCount} duration={1.5} />
          </h2>
        </div>
      </Card.Body>
    </Card>
  </div>

</div>

      {/* ================= DEPARTMENT ENROLLMENT ================= */}
      <div className="row mt-4">
        <div className="col-md-12">
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Department-wise Final Enrollment</h5>

              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Total Enrolled Students</th>
                  </tr>
                </thead>
                <tbody>
                  {deptEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="text-center">
                        No enrollment data
                      </td>
                    </tr>
                  ) : (
                    deptEnrollments.map((row, index) => (
                      <tr key={index}>
                        <td>{row.departmentName}</td>
                        <td>{row.totalEnrolled}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

            </Card.Body>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
