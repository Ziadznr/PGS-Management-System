import React, { Fragment, useEffect, useState } from "react";
import { PurchaseListRequest } from "../../APIRequest/PurchaseAPIRequest";
import { useSelector } from "react-redux";
import { AiOutlineEye } from "react-icons/ai";
import ReactPaginate from "react-paginate";
import moment from "moment";
import { NumericFormat as CurrencyFormat } from "react-number-format";

const PurchaseList = () => {
  const [searchKeyword, setSearchKeyword] = useState("0");
  const [perPage, setPerPage] = useState(20);
  const [pageNo, setPageNo] = useState(1);

  const DataList = useSelector((state) => state.purchase.List || []);
  const Total = useSelector((state) => state.purchase.ListTotal || 0);

  useEffect(() => {
    PurchaseListRequest(pageNo, perPage, searchKeyword);
  }, [pageNo, perPage, searchKeyword]);

  const handlePageClick = (event) => {
    setPageNo(event.selected + 1);
  };

  const searchData = () => {
    setPageNo(1);
    PurchaseListRequest(1, perPage, searchKeyword);
  };

  const perPageOnChange = (e) => {
    setPerPage(parseInt(e.target.value));
    setPageNo(1);
  };

  const searchKeywordOnChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value.length === 0 ? "0" : value);
    setPageNo(1);
  };

  const DetailsPopUp = (item) => {
    console.log("Details clicked for:", item);
  };

  // Sort the data by CreatedDate (newest first)
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
                {/* Header & Filters */}
                <div className="row mb-3">
                  <div className="col-4">
                    <h5>Purchase List</h5>
                  </div>
                  <div className="col-2">
                    <input
                      onKeyUp={(e) => {
                        const rows = document.querySelectorAll("tbody tr");
                        rows.forEach((row) => {
                          row.style.display = row.innerText
                            .toLowerCase()
                            .includes(e.target.value.toLowerCase())
                            ? ""
                            : "none";
                        });
                      }}
                      placeholder="Text Filter"
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div className="col-2">
                    <select
                      onChange={perPageOnChange}
                      className="form-select form-select-sm"
                    >
                      <option value="20">20 Per Page</option>
                      <option value="30">30 Per Page</option>
                      <option value="50">50 Per Page</option>
                      <option value="100">100 Per Page</option>
                      <option value="200">200 Per Page</option>
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
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="row">
                  <div className="col-12 table-responsive">
                    <table className="table table-striped table-bordered">
                      <thead className="sticky-top bg-white">
                        <tr>
                          <th>#</th>
                          <th>Supplier</th>
                          <th>Product Name</th>
                          <th>Qty</th>
                          <th>Total</th>
                          <th>Vat/Tax</th>
                          <th>Shipping</th>
                          <th>Other Cost</th>
                          <th>Discount</th>
                          <th>Grand Total</th>
                          <th>Purchase Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedData.length > 0 ? (
                          sortedData.map((item, index) =>
                            item.Products.map((product, pIndex) => (
                              <tr key={item._id + "_" + pIndex}>
                                {pIndex === 0 && (
                                  <td rowSpan={item.Products.length}>
                                    {(pageNo - 1) * perPage + index + 1}
                                  </td>
                                )}
                                {pIndex === 0 && (
                                  <td rowSpan={item.Products.length}>
                                    {item.SupplierName || "-"}
                                  </td>
                                )}
                                <td>{product.ProductName || "-"}</td>
                                <td>{product.Qty ?? 0}</td>
                                <td>
                                  <CurrencyFormat
                                    value={product.Total ?? 0}
                                    displayType={"text"}
                                    thousandSeparator
                                    prefix={"৳ "}
                                  />
                                </td>
                                {pIndex === 0 && (
                                  <>
                                    <td rowSpan={item.Products.length}>
                                      {item.VatTax ?? 0} %
                                    </td>
                                    <td rowSpan={item.Products.length}>
                                      <CurrencyFormat
                                        value={item.ShippingCost ?? 0}
                                        displayType={"text"}
                                        thousandSeparator
                                        prefix={"৳ "}
                                      />
                                    </td>
                                    <td rowSpan={item.Products.length}>
                                      <CurrencyFormat
                                        value={item.OtherCost ?? 0}
                                        displayType={"text"}
                                        thousandSeparator
                                        prefix={"৳ "}
                                      />
                                    </td>
                                    <td rowSpan={item.Products.length}>
                                      {item.Discount ?? 0} %
                                    </td>
                                    <td rowSpan={item.Products.length}>
                                      <CurrencyFormat
                                        value={item.GrandTotal ?? 0}
                                        displayType={"text"}
                                        thousandSeparator
                                        prefix={"৳ "}
                                      />
                                    </td>
                                    <td rowSpan={item.Products.length}>
                                      {moment(item.CreatedDate).format(
                                        "MMMM Do YYYY"
                                      )}
                                    </td>
                                    <td rowSpan={item.Products.length}>
                                      <button
                                        onClick={() => DetailsPopUp(item)}
                                        className="btn btn-outline-success btn-sm"
                                      >
                                        <AiOutlineEye size={15} />
                                      </button>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))
                          )
                        ) : (
                          <tr>
                            <td colSpan={12} className="text-center text-muted">
                              No data found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="row mt-3">
                  <div className="col-12">
                    <ReactPaginate
                      previousLabel="<"
                      nextLabel=">"
                      pageCount={Math.ceil(Total / perPage)}
                      marginPagesDisplayed={2}
                      pageRangeDisplayed={5}
                      onPageChange={handlePageClick}
                      containerClassName="pagination justify-content-center"
                      pageClassName="page-item"
                      pageLinkClassName="page-link"
                      previousClassName="page-item"
                      previousLinkClassName="page-link"
                      nextClassName="page-item"
                      nextLinkClassName="page-link"
                      breakLabel="..."
                      breakClassName="page-item disabled"
                      breakLinkClassName="page-link"
                      activeClassName="active"
                      disabledClassName="disabled"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default PurchaseList;
