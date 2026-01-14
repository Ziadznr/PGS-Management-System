import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import store from "../../redux/store/store";
import { ShowLoader, HideLoader } from "../../redux/state-slice/settings-slice";
import axios from "axios";
import { BaseURL } from "../../helper/config";
import { getToken } from "../../helper/SessionHelper";

// ---------------- Axios Header ----------------
const getAxiosHeader = () => ({
  headers: { token: getToken() }
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
            axios.get(`${BaseURL}/admin/users/list/1/1/0/Dean`, getAxiosHeader()),
            axios.get(`${BaseURL}/admin/users/list/1/1000/0/Chairman`, getAxiosHeader()),
            axios.get(`${BaseURL}/admin/users/list/1/1000/0/Supervisor`, getAxiosHeader()),
            axios.get(`${BaseURL}/admission/enrollment/summary`, getAxiosHeader())
          ]);

        setDean(deanRes.data?.data?.[0] || null);
        setChairmanCount(chairmanRes.data?.data?.length || 0);
        setSupervisorCount(supervisorRes.data?.data?.length || 0);
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
          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="text-muted">Dean (PGS)</h6>
              {dean ? (
                <>
                  <h5>{dean.name}</h5>
                  <p className="mb-0">{dean.email}</p>
                </>
              ) : (
                <p>No Dean Assigned</p>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Chairman Count */}
        <div className="col-md-4 mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="text-muted">Total Chairmen</h6>
              <h2>{chairmanCount}</h2>
            </Card.Body>
          </Card>
        </div>

        {/* Supervisor Count */}
        <div className="col-md-4 mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="text-muted">Total Supervisors</h6>
              <h2>{supervisorCount}</h2>
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
