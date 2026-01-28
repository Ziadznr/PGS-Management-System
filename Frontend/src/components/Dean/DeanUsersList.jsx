import React, { useEffect, useState, useRef } from "react";
import {
  DeanUsersListRequest
} from "../../APIRequest/UserAPIRequest";
import ReactPaginate from "react-paginate";
import { ErrorToast } from "../../helper/FormHelper";

const DeanUsersList = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [role, setRole] = useState("All");
  const [perPage, setPerPage] = useState(20);
  const [pageNo, setPageNo] = useState(1);
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const searchTimeout = useRef(null);

  /* ================= FETCH USERS ================= */
  const fetchUsers = async (page = 1, keyword = searchKeyword) => {
    try {
      setLoading(true);
      setPageNo(page);

      const result = await DeanUsersListRequest(
        page,
        perPage,
        keyword || "0",
        role
      );

      setUsers(result?.Rows || []);
      setTotalCount(result?.Total?.[0]?.count || 0);

    } catch (error) {
      console.error(error);
      ErrorToast("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchUsers(1);
  }, [perPage, role]);

  /* ================= DEBOUNCED SEARCH ================= */
  useEffect(() => {
    clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      fetchUsers(1, searchKeyword);
    }, 500);

    return () => clearTimeout(searchTimeout.current);
  }, [searchKeyword]);

  const handlePageClick = (event) => {
    fetchUsers(event.selected + 1);
  };

  return (
    <div className="container-fluid my-4">

      {/* FILTERS */}
      <div className="row mb-3 align-items-center">
        <div className="col-3">
          <h5>Users List (Read Only)</h5>
        </div>

        <div className="col-2">
          <input
            className="form-control form-control-sm"
            placeholder="Search name/email"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        <div className="col-2">
          <select
            className="form-select form-select-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Dean">Dean</option>
            <option value="Chairman">Chairman</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Student">Student</option>
          </select>
        </div>

        <div className="col-2">
          <select
            className="form-select form-select-sm"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
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
              <th>Role</th>
              <th>Department</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center">Loading...</td>
              </tr>
            ) : users.length ? (
              users.map((u, i) => (
                <tr key={u._id}>
                  <td>{i + 1 + (pageNo - 1) * perPage}</td>

                  <td>
                    <strong>{u.name}</strong>

                    {u.role === "Supervisor" && u.subject && (
                      <div className="text-muted small">
                        (Subject: {u.subject})
                      </div>
                    )}
                  </td>

                  <td>{u.email}</td>
                  <td>{u.phone || "-"}</td>
                  <td>{u.role}</td>
                  <td>{u.DepartmentName || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalCount > perPage && (
        <ReactPaginate
          previousLabel="<"
          nextLabel=">"
          pageCount={Math.ceil(totalCount / perPage)}
          onPageChange={handlePageClick}
          containerClassName="pagination"
          activeClassName="active"
        />
      )}
    </div>
  );
};

export default DeanUsersList;
