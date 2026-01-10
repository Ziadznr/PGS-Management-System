// src/components/Section/SectionList.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { SectionListRequest, DeleteSectionRequest } from "../../APIRequest/SectionAPIRequest";
import { Link } from "react-router-dom";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import ReactPaginate from "react-paginate";
import moment from "moment";
import { DeleteAlert } from "../../helper/DeleteAlert";

const SectionList = ({ refreshFlag }) => { // <-- accept refreshFlag
  const [searchKeyword, setSearchKeyword] = useState("0");
  const [perPage, setPerPage] = useState(20);
  const [pageNo, setPageNo] = useState(1);

  const DataList = useSelector((state) => state.section.List);
  const Total = useSelector((state) => state.section.ListTotal);

  const fetchData = async (page = pageNo, perPageCount = perPage, keyword = searchKeyword) => {
    await SectionListRequest(page, perPageCount, keyword || "0");
  };

  // Initial fetch & refresh on refreshFlag change
  useEffect(() => {
    fetchData(1, perPage, searchKeyword);
    setPageNo(1);
  }, [refreshFlag]);

  // Pagination
  const handlePageClick = async (event) => {
    const selectedPage = event.selected + 1;
    setPageNo(selectedPage);
    await fetchData(selectedPage, perPage, searchKeyword);
  };

  // Search button
  const searchData = async () => {
    setPageNo(1);
    await fetchData(1, perPage, searchKeyword);
  };

  // Per-page selection
  const perPageOnChange = async (e) => {
    const newPerPage = parseInt(e.target.value);
    setPerPage(newPerPage);
    setPageNo(1);
    await fetchData(1, newPerPage, searchKeyword);
  };

  // Search input
  const searchKeywordOnChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value === "" ? "0" : value);
  };

  // Delete section
  const DeleteItem = async (id) => {
    const Result = await DeleteAlert();
    if (Result.isConfirmed) {
      const DeleteResult = await DeleteSectionRequest(id);
      if (DeleteResult) {
        await fetchData(1, perPage, searchKeyword);
        setPageNo(1);
      }
    }
  };

  return (
    <div className="container-fluid my-5">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-4">
                  <h5>Section List</h5>
                </div>

                <div className="col-2">
                  <input
                    value={searchKeyword === "0" ? "" : searchKeyword}
                    onChange={searchKeywordOnChange}
                    placeholder="Search by name"
                    className="form-control form-control-sm"
                  />
                </div>

                <div className="col-2">
                  <select
                    value={perPage}
                    onChange={perPageOnChange}
                    className="form-select form-select-sm form-control-sm"
                  >
                    <option value="20">20 Per Page</option>
                    <option value="30">30 Per Page</option>
                    <option value="50">50 Per Page</option>
                    <option value="100">100 Per Page</option>
                    <option value="200">200 Per Page</option>
                  </select>
                </div>

                <div className="col-4">
                  <button onClick={searchData} className="btn btn-success btn-sm">
                    Search
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive table-section">
                <table className="table">
                  <thead className="sticky-top bg-white">
                    <tr>
                      <td>No</td>
                      <td>Section Name</td>
                      <td>Created</td>
                      <td>Action</td>
                    </tr>
                  </thead>
                  <tbody>
                    {DataList.length > 0 ? (
                      DataList.map((item, i) => (
                        <tr key={item._id}>
                          <td>{(pageNo - 1) * perPage + i + 1}</td>
                          <td>{item.Name}</td>
                          <td>{moment(item.CreatedDate).format("MMMM Do YYYY")}</td>
                          <td>
                            <Link
                              to={`/SectionCreatePage?id=${item._id}`}
                              className="btn text-info btn-outline-light p-2 mb-0 btn-sm"
                            >
                              <AiOutlineEdit size={15} />
                            </Link>
                            <button
                              onClick={() => DeleteItem(item._id)}
                              className="btn btn-outline-light text-danger p-2 mb-0 btn-sm ms-2"
                            >
                              <AiOutlineDelete size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center">
                          No Data Found
                        </td>
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
  );
};

export default SectionList;
