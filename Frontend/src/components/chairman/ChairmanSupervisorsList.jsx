import React, { useEffect, useState, useRef } from "react";
import { ChairmanSupervisorsListRequest } from "../../APIRequest/UserAPIRequest";

const ChairmanSupervisorsList = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const searchTimeout = useRef(null);

  const fetchUsers = async (keyword = "0") => {
    const data = await ChairmanSupervisorsListRequest(keyword);
    setUsers(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchUsers(searchKeyword || "0");
    }, 400);

    return () => clearTimeout(searchTimeout.current);
  }, [searchKeyword]);

  return (
    <div className="container-fluid my-4">

      {/* HEADER */}
      <div className="row mb-3">
        <div className="col-4">
          <h5>Supervisors (My Department)</h5>
        </div>

        <div className="col-3">
          <input
            className="form-control form-control-sm"
            placeholder="Search name / email"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Subject</th>
              <th>Department</th>
            </tr>
          </thead>

          <tbody>
            {users.length ? (
              users.map((u, i) => (
                <tr key={u._id}>
                  <td>{i + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{u.subject || "-"}</td>
                  <td>{u.DepartmentName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No supervisors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ChairmanSupervisorsList;
