import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import ReactPaginate from "react-paginate";

import { DepartmentListRequest, DeleteDepartmentRequest } from "../../APIRequest/DepartmentAPIRequest";
import { DeleteAlert } from "../../helper/DeleteAlert";

const DepartmentList = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [perPage, setPerPage] = useState(20);

  const DataList = useSelector((state) => state.department.List);
  const Total = useSelector((state) => state.department.ListTotal);

  // Fetch list on load or when perPage/searchKeyword changes
  useEffect(() => {
    DepartmentListRequest(1, perPage, searchKeyword || "0");
  }, [perPage, searchKeyword]);

  // Pagination
  const handlePageClick = async (event) => {
    await DepartmentListRequest(event.selected + 1, perPage, searchKeyword || "0");
  };

  // Search button
  const searchData = async () => {
    await DepartmentListRequest(1, perPage, searchKeyword || "0");
  };

  // Delete department
  const DeleteItem = async (id) => {
    const Result = await DeleteAlert();
    if (Result.isConfirmed) {
      const DeleteResult = await DeleteDepartmentRequest(id);
      if (DeleteResult) {
        await DepartmentListRequest(1, perPage, searchKeyword || "0");
      }
    }
  };

  return (
    <Fragment>
      <div className="container-fluid my-5">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">

                {/* Header */}
                <div className="row mb-3 align-items-center">
                  <div className="col-4">
                    <h5>Department List</h5>
                  </div>

                  <div className="col-4">
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="form-control form-control-sm"
                      />
                      <button onClick={searchData} className="btn btn-success btn-sm">Search</button>
                    </div>
                  </div>

                  <div className="col-2">
                    <select
                      value={perPage}
                      onChange={(e) => setPerPage(parseInt(e.target.value))}
                      className="form-select form-select-sm"
                    >
                      <option value={20}>20 Per Page</option>
                      <option value={30}>30 Per Page</option>
                      <option value={50}>50 Per Page</option>
                      <option value={100}>100 Per Page</option>
                      <option value={200}>200 Per Page</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="table-responsive table-section">
                  <table className="table">
                    <thead className="sticky-top bg-white">
                      <tr>
                        <th>No</th>
                        <th>Department Name</th>
                        <th>Faculty Name</th>
                        <th>Created Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DataList && DataList.length > 0 ? (
                        DataList.map((item, i) => (
                          <tr key={item._id || i}>
                            <td>{i + 1}</td>
                            <td>{item.Name}</td>
                            <td>{item.Faculty?.[0]?.Name || item.Faculty?.Name || "-"}</td>
                            <td>{new Date(item.CreatedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</td>
                            <td>
                              <Link to={`/DepartmentCreateUpdatePage?id=${item._id}`} className="btn text-info btn-outline-light p-2 mb-0 btn-sm">
                                <AiOutlineEdit size={15} />
                              </Link>
                              <button onClick={() => DeleteItem(item._id)} className="btn btn-outline-light text-danger p-2 mb-0 btn-sm ms-2">
                                <AiOutlineDelete size={15} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center">No Data Found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-4">
                  <ReactPaginate
                    previousLabel="<"
                    nextLabel=">"
                    pageClassName="page-item"
                    pageLinkClassName="page-link"
                    previousClassName="page-item"
                    previousLinkClassName="page-link"
                    nextClassName="page-item"
                    nextLinkClassName="page-link"
                    breakLabel="..."
                    breakClassName="page-item"
                    breakLinkClassName="page-link"
                    pageCount={Math.ceil(Total / perPage)}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePageClick}
                    containerClassName="pagination"
                    activeClassName="active"
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default DepartmentList;
