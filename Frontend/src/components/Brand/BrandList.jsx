import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import { BrandListRequest, DeleteBrandRequest } from "../../APIRequest/BrandAPIRequest";
import { Link } from "react-router-dom";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import ReactPaginate from "react-paginate";
import { DeleteAlert } from "../../helper/DeleteAlert";

const BrandList = () => {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [perPage, setPerPage] = useState(20);
    const [pageNo, setPageNo] = useState(1);

    const DataList = useSelector(state => state.brand.List);
    const Total = useSelector(state => state.brand.ListTotal);

    // Fetch brands whenever pageNo, perPage, or searchKeyword changes
    useEffect(() => {
        const fetchBrands = async () => {
            const keyword = searchKeyword.trim() === "" ? "0" : searchKeyword.trim();
            await BrandListRequest(pageNo, perPage, keyword);
        };
        fetchBrands();
    }, [pageNo, perPage, searchKeyword]);

    const handlePageClick = (event) => {
        setPageNo(event.selected + 1);
    };

    const searchData = () => {
        setPageNo(1); // reset to first page when searching
    };

    const perPageOnChange = (e) => {
        setPerPage(parseInt(e.target.value));
        setPageNo(1);
    };

    const searchKeywordOnChange = (e) => {
        setSearchKeyword(e.target.value);
    };

    const DeleteItem = async (id) => {
        const Result = await DeleteAlert();
        if (Result.isConfirmed) {
            const DeleteResult = await DeleteBrandRequest(id);
            if (DeleteResult) {
                await BrandListRequest(pageNo, perPage, searchKeyword.trim() === "" ? "0" : searchKeyword);
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
                                <div className="col-4"><h5>Brand List</h5></div>
                                <div className="col-2">
                                    <input
                                        type="text"
                                        placeholder="Search by brand name"
                                        className="form-control form-control-sm"
                                        value={searchKeyword}
                                        onChange={searchKeywordOnChange}
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
                                    <button className="btn btn-success btn-sm" onClick={searchData}>Search</button>
                                </div>
                            </div>

                            <div className="table-responsive table-section">
                                <table className="table">
                                    <thead className="sticky-top bg-white">
                                        <tr>
                                            <td>No</td>
                                            <td>Brand Name</td>
                                            <td>Action</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {DataList.length > 0 ? (
                                            DataList.map((item, i) => (
                                                <tr key={item._id}>
                                                    <td>{i + 1 + (pageNo - 1) * perPage}</td>
                                                    <td>{item.Name}</td>
                                                    <td>
                                                        <Link
                                                            to={`/BrandCreateUpdatePage?id=${item._id}`}
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
                                                <td colSpan={3} className="text-center">No Data Found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {Total > perPage && (
                                <div className="mt-4">
                                    <ReactPaginate
                                        previousLabel="<"
                                        nextLabel=">"
                                        pageCount={Math.ceil(Total / perPage)}
                                        onPageChange={handlePageClick}
                                        containerClassName="pagination"
                                        pageClassName="page-item"
                                        pageLinkClassName="page-link"
                                        previousClassName="page-item"
                                        previousLinkClassName="page-link"
                                        nextClassName="page-item"
                                        nextLinkClassName="page-link"
                                        breakLabel="..."
                                        breakClassName="page-item"
                                        breakLinkClassName="page-link"
                                        marginPagesDisplayed={2}
                                        pageRangeDisplayed={5}
                                        activeClassName="active"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandList;
