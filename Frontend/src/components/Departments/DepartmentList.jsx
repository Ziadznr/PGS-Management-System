import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import ReactPaginate from "react-paginate";
import Swal from "sweetalert2";

import {
  DepartmentListRequest,
  DeleteDepartmentRequest,
  CreateDepartmentRequest
} from "../../APIRequest/DepartmentAPIRequest";
import { DeleteAlert } from "../../helper/DeleteAlert";
import { SuccessToast } from "../../helper/FormHelper";

const DepartmentList = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [perPage, setPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // subject editor
  const [expandedDept, setExpandedDept] = useState(null);

  const DataList = useSelector(state => state.department.List);
  const Total = useSelector(state => state.department.ListTotal);

  /* ================= LOAD ================= */
  useEffect(() => {
    DepartmentListRequest(currentPage, perPage, searchKeyword || "0");
  }, [currentPage, perPage, searchKeyword]);

  /* ================= PAGINATION ================= */
  const handlePageClick = (event) => {
    setCurrentPage(event.selected + 1);
  };

  /* ================= DELETE DEPARTMENT ================= */
  const DeleteItem = async (id) => {
    const Result = await DeleteAlert(
      "Delete Department?",
      "Existing admission records will NOT be affected."
    );

    if (Result.isConfirmed) {
      const ok = await DeleteDepartmentRequest(id);
      if (ok) {
        DepartmentListRequest(1, perPage, searchKeyword || "0");
      }
    }
  };

  /* ================= SUBJECT ACTIONS ================= */
  const updateSubjects = async (dept) => {
    const payload = {
  program: dept.program,
  departmentName: dept.departmentName,
  departmentCode: dept.departmentCode,
  offeredSubjects: dept.offeredSubjects
};

    const ok = await CreateDepartmentRequest(payload, dept._id);
    if (ok) {
      SuccessToast("Subjects updated");
      DepartmentListRequest(currentPage, perPage, searchKeyword || "0");
    }
  };

  const toggleSubject = (dept, subjectId) => {
    dept.offeredSubjects = dept.offeredSubjects.map(s =>
      s._id === subjectId ? { ...s, isActive: !s.isActive } : s
    );
    updateSubjects(dept);
  };

  const removeSubject = async (dept, subjectId) => {
    const confirm = await Swal.fire({
      title: "Remove Subject?",
      text: "This will NOT affect existing admission records.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Remove"
    });

    if (!confirm.isConfirmed) return;

    dept.offeredSubjects = dept.offeredSubjects.map(s =>
      s._id === subjectId ? { ...s, isActive: false } : s
    );

    updateSubjects(dept);
  };

  /* ================= UI ================= */
  return (
    <Fragment>
      <div className="container-fluid my-5">
        <div className="card shadow-sm">
          <div className="card-body">

            {/* HEADER */}
            <div className="row mb-3">
              <div className="col-md-4">
                <h5 className="fw-bold">Department List</h5>
                <small className="text-muted">Faculty: PGS</small>
              </div>

              <div className="col-md-4">
                <div className="input-group">
                  <input
                    className="form-control form-control-sm"
                    placeholder="Search department..."
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                  />
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => {
                      setCurrentPage(1);
                      DepartmentListRequest(1, perPage, searchKeyword || "0");
                    }}
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="col-md-2">
                <select
                  className="form-select form-select-sm"
                  value={perPage}
                  onChange={e => setPerPage(Number(e.target.value))}
                >
                  {[20, 30, 50, 100, 200].map(n => (
                    <option key={n} value={n}>{n} / Page</option>
                  ))}
                </select>
              </div>
            </div>

            {/* TABLE */}
            <table className="table table-bordered align-middle">
              <thead className="table-light">
  <tr>
    <th>#</th>
    <th>Program</th>
    <th>Department</th>
    <th>Code</th>
    <th>Subjects</th>
    <th>Created</th>
    <th>Action</th>
  </tr>
</thead>

              <tbody>
                {DataList?.length ? DataList.map((dept, i) => (
                  <Fragment key={dept._id}>
                    <tr>
                      <td>{(currentPage - 1) * perPage + i + 1}</td>
                      <td>
  <span className="badge bg-primary">{dept.program}</span>
</td>

<td className="fw-medium">
  {dept.departmentName}
</td>

<td>
  <span className="badge bg-secondary">
    {dept.departmentCode}
  </span>
</td>
                      <td>
                        {dept.offeredSubjects?.filter(s => s.isActive).length || 0}
                      </td>

                      <td>
                        {new Date(dept.createdAt).toLocaleDateString()}
                      </td>

                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() =>
                            setExpandedDept(
                              expandedDept === dept._id ? null : dept._id
                            )
                          }
                        >
                          Subjects
                        </button>

                        <Link
                          to={`/DepartmentCreateUpdatePage?id=${dept._id}`}
                          className="btn btn-sm btn-outline-info me-2"
                        >
                          <AiOutlineEdit />
                        </Link>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => DeleteItem(dept._id)}
                        >
                          <AiOutlineDelete />
                        </button>
                      </td>
                    </tr>

                    {/* SUBJECT PANEL */}
                    {expandedDept === dept._id && (
                      <tr>
                        <td colSpan={5}>
                          {dept.offeredSubjects?.length ? (
                            dept.offeredSubjects.map(s => (
                              <div
                                key={s._id}
                                className="d-flex justify-content-between border rounded p-2 mb-2"
                              >
                                <span
                                  className={
                                    s.isActive
                                      ? "fw-medium"
                                      : "text-muted text-decoration-line-through"
                                  }
                                >
                                  {s.name}
                                </span>

                                <div>
                                  <button
                                    className={`btn btn-sm ${
                                      s.isActive
                                        ? "btn-warning"
                                        : "btn-success"
                                    } me-2`}
                                    onClick={() =>
                                      toggleSubject(dept, s._id)
                                    }
                                  >
                                    {s.isActive ? "Deactivate" : "Activate"}
                                  </button>

                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() =>
                                      removeSubject(dept, s._id)
                                    }
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted">
                              No subjects added.
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      No departments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            {Total > perPage && (
              <div className="mt-4 d-flex justify-content-center">
                <ReactPaginate
                  previousLabel="«"
                  nextLabel="»"
                  breakLabel="..."
                  pageCount={Math.ceil(Total / perPage)}
                  onPageChange={handlePageClick}
                  containerClassName="pagination"
                  activeClassName="active"
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default DepartmentList;
