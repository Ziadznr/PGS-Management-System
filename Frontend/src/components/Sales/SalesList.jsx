import React, { Fragment, useEffect, useState, useRef } from "react";
import { SaleListRequest } from "../../APIRequest/SaleAPIRequest";
import { useSelector } from "react-redux";
import { AiOutlineEye } from "react-icons/ai";
import ReactPaginate from "react-paginate";
import { NumericFormat as CurrencyFormat } from "react-number-format";
import moment from "moment/moment";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const SalesList = () => {
  const [searchKeyword, setSearchKeyword] = useState("0");
  const [perPage, setPerPage] = useState(20);
  const [pageNo, setPageNo] = useState(1);
  

  const DataList = useSelector((state) => state.sale.List || []);
  const Total = useSelector((state) => state.sale.ListTotal || 0);

  const invoiceRef = useRef();
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    (async () => {
      await SaleListRequest(pageNo, perPage, searchKeyword);
    })();
  }, [pageNo, perPage, searchKeyword]);

  const handlePageClick = async (event) => {
    setPageNo(event.selected + 1);
    await SaleListRequest(event.selected + 1, perPage, searchKeyword);
  };

  const searchData = async () => {
    setPageNo(1);
    await SaleListRequest(1, perPage, searchKeyword);
  };

  const perPageOnChange = async (e) => {
    const value = parseInt(e.target.value);
    setPerPage(value);
    setPageNo(1);
    await SaleListRequest(1, value, searchKeyword);
  };

  const searchKeywordOnChange = async (e) => {
    const value = e.target.value;
    setSearchKeyword(value.length === 0 ? "0" : value);
    if (value.length === 0) {
      setPageNo(1);
      await SaleListRequest(1, perPage, "0");
    }
  };

  const TextSearch = (e) => {
    const rows = document.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      row.style.display = row.innerText
        .toLowerCase()
        .includes(e.target.value.toLowerCase())
        ? ""
        : "none";
    });
  };

  const DetailsPopUp = (item) => {
    console.log("Details for:", item);
  };

  const generateInvoicePDF = async (sale) => {
    setSelectedSale(sale);
    invoiceRef.current.style.display = "block";

    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 1.5,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.7);
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    const customerName = sale.CustomerData?.CustomerName?.replace(/\s+/g, "_") || "Sale";
    const slipNo = sale.SlipNo ? `${sale.SlipNo.toString().slice(-4)}` : "Sale";
    pdf.save(`Invoice_${customerName}_${slipNo}.pdf`);

    invoiceRef.current.style.display = "none";
    setSelectedSale(null);
  };

  const sortedData = [...DataList].sort(
    (a, b) => new Date(b.CreatedDate) - new Date(a.CreatedDate)
  );

  return (
    <Fragment>
      <div className="container-fluid my-5">
        {/* Filters & Table */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="container-fluid">
                  {/* Filters */}
                  <div className="row mb-3">
                    <div className="col-4"><h5>Sales List</h5></div>
                    <div className="col-2">
                      <input onKeyUp={TextSearch} placeholder="Text Filter" className="form-control form-control-sm" />
                    </div>
                    <div className="col-2">
                      <select onChange={perPageOnChange} className="form-control mx-2 form-select-sm form-select form-control-sm">
                        <option value="20">20 Per Page</option>
                        <option value="30">30 Per Page</option>
                        <option value="50">50 Per Page</option>
                        <option value="100">100 Per Page</option>
                        <option value="200">200 Per Page</option>
                      </select>
                    </div>
                    <div className="col-4">
                      <div className="input-group mb-3">
                        <input onChange={searchKeywordOnChange} type="text" className="form-control form-control-sm" placeholder="Search..." />
                        <button onClick={searchData} className="btn btn-success btn-sm mb-0">Search</button>
                      </div>
                    </div>
                  </div>

                  {/* Sales Table */}
                  <div className="row">
                    <div className="col-12">
                      <div className="table-responsive table-section">
                        <table className="table table-striped table-bordered">
  <thead className="sticky-top bg-white">
    <tr>
      <th>#</th>
      <th>Slip No</th>
      <th>Customer Name</th>
      <th>Category</th>
      <th>Faculty</th>
      <th>Department</th>
      <th>Section</th>
      <th>Product</th>
      <th>Qty</th>
      <th>Available Qty</th>  {/* ✅ New column */}
      <th>Total</th>
      <th>Other Cost</th>
      <th>Grand Total</th>
      <th>Date</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {sortedData.length > 0 ? (
      sortedData.map((item, i) => {
        const customer = item.CustomerData || {};
        return item.Products && item.Products.length > 0 ? (
          item.Products.map((p, idx) => (
            <tr key={`${i}-${idx}`}>
              {idx === 0 && <td rowSpan={item.Products.length}>{(pageNo - 1) * perPage + i + 1}</td>}
              {idx === 0 && <td rowSpan={item.Products.length}>{item.SlipNo ? `-${item.SlipNo}` : "-"}</td>}
              <td>{customer.CustomerName || "-"}</td>
              <td>{customer.Category || "-"}</td>
              <td>{customer.FacultyName || "-"}</td>
              <td>{customer.DepartmentName || "-"}</td>
              <td>{customer.SectionName || "-"}</td>
              <td>{p.ProductName || "-"}</td>
              <td>{p.Qty}</td>
              <td>{p.AvailableQty ?? p.Qty}</td> {/* ✅ Show Available Qty */}
              <td>
                <CurrencyFormat value={p.Total} displayType={"text"} thousandSeparator prefix={"$"} />
              </td>
              {idx === 0 && (
                <>
                  <td rowSpan={item.Products.length}>
                    <CurrencyFormat value={item.OtherCost} displayType={"text"} thousandSeparator prefix={"$"} />
                  </td>
                  <td rowSpan={item.Products.length}>
                    <CurrencyFormat value={item.GrandTotal} displayType={"text"} thousandSeparator prefix={"$"} />
                  </td>
                  <td rowSpan={item.Products.length}>{moment(item.CreatedDate).format("DD-MM-YYYY")}</td>
                  <td rowSpan={item.Products.length}>
                    <button onClick={() => DetailsPopUp(item)} className="btn btn-outline-success btn-sm me-2"><AiOutlineEye size={15} /></button>
                    <button onClick={() => generateInvoicePDF(item)} className="btn btn-outline-primary btn-sm">PDF</button>
                  </td>
                </>
              )}
            </tr>
          ))
        ) : (
          <tr key={i}>
            <td>{(pageNo - 1) * perPage + i + 1}</td>
            <td>{customer.CustomerName || "-"}</td>
            <td>{customer.Category || "-"}</td>
            <td>{customer.FacultyName || "-"}</td>
            <td>{customer.DepartmentName || "-"}</td>
            <td>{customer.SectionName || "-"}</td>
            <td colSpan="3" className="text-center">No Products</td>
            <td>
              <CurrencyFormat value={item.OtherCost} displayType={"text"} thousandSeparator prefix={"$"} />
            </td>
            <td>
              <CurrencyFormat value={item.GrandTotal} displayType={"text"} thousandSeparator prefix={"$"} />
            </td>
            <td>{moment(item.CreatedDate).format("DD-MM-YYYY")}</td>
            <td>
              <button onClick={() => DetailsPopUp(item)} className="btn btn-outline-success btn-sm me-2"><AiOutlineEye size={15} /></button>
              <button onClick={() => generateInvoicePDF(item)} className="btn btn-outline-primary btn-sm">PDF</button>
            </td>
          </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan="15" className="text-center text-muted">No data found</td>
      </tr>
    )}
  </tbody>
</table>

                      </div>
                    </div>

                    {/* Pagination */}
                    <div className="col-12 mt-5">
                      <ReactPaginate
                        previousLabel="<"
                        nextLabel=">"
                        breakLabel="..."
                        pageCount={Math.ceil(Total / perPage)}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={handlePageClick}
                        containerClassName="pagination justify-content-center mt-4"
                        pageClassName="page-item"
                        pageLinkClassName="page-link"
                        previousClassName="page-item"
                        previousLinkClassName="page-link"
                        nextClassName="page-item"
                        nextLinkClassName="page-link"
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

        {/* Hidden Invoice for PDF */}
        {selectedSale && (
          <div
            id="invoice"
            ref={invoiceRef}
            style={{
              display: "none",
              padding: 50,
              fontFamily: "'Kalpurush', sans-serif",
              minHeight: "100vh",
              border: "1px solid #ccc",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Top Section */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
              <img src="/patuakhali-science-technology-university-logo-png_seeklogo-432827.png" alt="Logo" style={{ width: 100, height: 100 }} />
              <div style={{ textAlign: "center", flex: 1, marginLeft: 20 }}>
                <h6 style={{ margin: 0, fontWeight: "bold", color: "#871003", fontSize: 26 }}>
                  Patuakhali Science and Technology University
                </h6>
                <div style={{ height: 15 }} />
                <h2 style={{ margin: 0, fontSize: 20 }}>পটুয়াখালী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়</h2>
                <p style={{ margin: 0, fontSize: 14 }}>দুমকি, পটুয়াখালী-৮৬৬০</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <h5>Slip No: {selectedSale?.SlipNo || "-"}</h5>
              </div>
            </div>

            <hr style={{ marginBottom: 25 }} />

            <div style={{ textAlign: "right", marginBottom: 25 }}>
              <p style={{ fontSize: 14 }}>Distributed Date: {moment(selectedSale.CreatedDate).format("DD-MM-YYYY")}</p>
            </div>

            <div style={{ marginBottom: 25 }}>
              <h3>Customer Details:</h3>
              <p>Name: {selectedSale.CustomerData?.CustomerName || "-"}</p>
              <p>Category: {selectedSale.CustomerData?.Category || "-"}</p>
              {["chairman", "teacher", "dean"].includes(selectedSale.CustomerData?.Category?.toLowerCase()) && <p>Faculty: {selectedSale.CustomerData?.FacultyName || "-"}</p>}
              {["chairman", "teacher"].includes(selectedSale.CustomerData?.Category?.toLowerCase()) && <p>Department: {selectedSale.CustomerData?.DepartmentName || "-"}</p>}
              {selectedSale.CustomerData?.Category?.toLowerCase() === "officer" && <p>Section: {selectedSale.CustomerData?.SectionName || "-"}</p>}
              <p>Email: {selectedSale.CustomerData?.Email || "-"}</p>
              <p>Phone: {selectedSale.CustomerData?.Phone || "-"}</p>
            </div>

            {/* Products Table with Available Qty */}
            <h3>Products:</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 25 }}>
              <thead>
                <tr style={{ backgroundColor: "#16a089", color: "white" }}>
                  <th style={{ border: "1px solid #000", padding: 8 }}>Product</th>
                  <th style={{ border: "1px solid #000", padding: 8 }}>Qty</th>
                  <th style={{ border: "1px solid #000", padding: 8 }}>Available Qty</th>
                  <th style={{ border: "1px solid #000", padding: 8 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedSale.Products?.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ border: "1px solid #000", padding: 8 }}>{p.ProductName}</td>
                    <td style={{ border: "1px solid #000", padding: 8 }}>{p.Qty}</td>
                    <td style={{ border: "1px solid #000", padding: 8 }}>{p.AvailableQty ?? p.Qty}</td>
                    <td style={{ border: "1px solid #000", padding: 8 }}>
                      <CurrencyFormat value={p.Total} displayType={"text"} thousandSeparator prefix={"$"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div style={{ marginBottom: 35 }}>
              <p>Other Cost: ${selectedSale.OtherCost || 0}</p>
              <h3>Grand Total: ${selectedSale.GrandTotal || 0}</h3>
            </div>

            {/* Signature */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 50 }}>
              <div>
                <p>_________________________</p>
                <p>Authorized Signature</p>
              </div>
              <div>
                <p>_________________________</p>
                <p>Teacher/Officer Signature</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default SalesList;
