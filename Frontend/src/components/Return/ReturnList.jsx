import React, { Fragment, useEffect, useState } from "react";
import { ReturnListRequest } from "../../APIRequest/ReturnAPIRequest";
import { useSelector } from "react-redux";
import { AiOutlineEye } from "react-icons/ai";
import ReactPaginate from "react-paginate";
import moment from "moment";

const ReturnList = () => {
  const [searchKeyword, setSearchKeyword] = useState("0");
  const [perPage, setPerPage] = useState(20);
  const [pageNo, setPageNo] = useState(1);

  const DataList = useSelector((state) => state.return.List || []);
  const Total = useSelector((state) => state.return.ListTotal || 0);

  useEffect(() => {
    ReturnListRequest(pageNo, perPage, searchKeyword);
  }, [pageNo, perPage, searchKeyword]);

  const handlePageClick = (event) => {
    setPageNo(event.selected + 1);
  };

  const searchData = () => {
    setPageNo(1);
  };

  const perPageOnChange = (e) => {
    setPerPage(parseInt(e.target.value, 10));
    setPageNo(1);
  };

  const searchKeywordOnChange = (e) => {
    const value = e.target.value.trim();
    setSearchKeyword(value === "" ? "0" : value);
    setPageNo(1);
  };

  const TextSearch = (e) => {
    const rows = document.querySelectorAll("tbody tr");
    const filter = e.target.value.toLowerCase();
    rows.forEach((row) => {
      row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
  };

  const DetailsPopUp = (item) => {
    console.log("Return Details:", item);
    // You can implement a modal popup here
  };

  const sortedData = [...DataList].sort(
    (a, b) => new Date(b.CreatedDate) - new Date(a.CreatedDate)
  );

  return (
    <Fragment>
      <div className="container-fluid my-5">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                {/* Filters */}
                <div className="row mb-3 align-items-center">
                  <div className="col-4">
                    <h5>Return List</h5>
                  </div>
                  <div className="col-2">
                    <input
                      onKeyUp={TextSearch}
                      placeholder="Text Filter"
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div className="col-2">
                    <select
                      onChange={perPageOnChange}
                      className="form-select form-select-sm"
                      value={perPage}
                    >
                      {[20, 30, 50, 100, 200].map((num) => (
                        <option key={num} value={num}>
                          {num} Per Page
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-4">
                    <div className="input-group">
                      <input
                        onChange={searchKeywordOnChange}
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search..."
                      />
                      <button
                        onClick={searchData}
                        className="btn btn-success btn-sm"
                        type="button"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="table-responsive table-section">
                  <table className="table table-sm table-bordered">
                    <thead className="sticky-top bg-white">
                      <tr>
                        <th>#</th>
                        <th>Customer Name</th>
                        <th>Category</th>
                        <th>Faculty</th>
                        <th>Department</th>
                        <th>Section</th>
                        <th>Slip No</th>
                        <th>Return Date</th>
                        <th>Reason</th>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Available</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.length === 0 ? (
                        <tr>
                          <td colSpan="13" className="text-center text-muted">
                            No data found
                          </td>
                        </tr>
                      ) : (
                        sortedData.map((item, i) => {
                          const customer = item.CustomerData || {};
                          if (!item.Products || item.Products.length === 0) {
                            return (
                              <tr key={i}>
                                <td>{(pageNo - 1) * perPage + i + 1}</td>
                                <td>{customer.CustomerName || "-"}</td>
                                <td>{customer.Category || "-"}</td>
                                <td>{customer.FacultyName || "-"}</td>
                                <td>{customer.DepartmentName || "-"}</td>
                                <td>{customer.SectionName || "-"}</td>
                                <td>{item.SlipNo || "-"}</td>
                                <td>
                                  {item.GivenDate
                                    ? moment(item.GivenDate).format("DD-MM-YYYY")
                                    : "-"}
                                </td>
                                <td>{item.Reason || "-"}</td>
                                <td colSpan="3" className="text-center">
                                  No Products
                                </td>
                              </tr>
                            );
                          }

                          return item.Products.map((p, idx) => (
                            <tr key={`${i}-${idx}`}>
                              {idx === 0 && (
                                <>
                                  <td rowSpan={item.Products.length}>
                                    {(pageNo - 1) * perPage + i + 1}
                                  </td>
                                  <td rowSpan={item.Products.length}>
                                    {customer.CustomerName || "-"}
                                  </td>
                                  <td rowSpan={item.Products.length}>
                                    {customer.Category || "-"}
                                  </td>
                                  <td rowSpan={item.Products.length}>
                                    {customer.FacultyName || "-"}
                                  </td>
                                  <td rowSpan={item.Products.length}>
                                    {customer.DepartmentName || "-"}
                                  </td>
                                  <td rowSpan={item.Products.length}>
                                    {customer.SectionName || "-"}
                                  </td>
                                  <td rowSpan={item.Products.length}>{item.SlipNo || "-"}</td>
                                  <td rowSpan={item.Products.length}>
                                    {item.GivenDate
                                      ? moment(item.GivenDate).format("DD-MM-YYYY")
                                      : "-"}
                                  </td>
                                  <td rowSpan={item.Products.length}>{item.Reason || "-"}</td>
                                </>
                              )}

                              <td>{p.ProductName || "-"}</td>
                              <td>{p.Qty ?? "-"}</td>
                              <td>{p.AvailableQty ?? "-"}</td>

                              {idx === 0 && (
                                <td rowSpan={item.Products.length}>
                                  <button
                                    onClick={() => DetailsPopUp(item)}
                                    className="btn btn-outline-success btn-sm"
                                  >
                                    <AiOutlineEye size={15} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ));
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-3 d-flex justify-content-center">
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
                    disabledClassName="disabled"
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

export default ReturnList;
