import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ErrorToast, IsEmpty } from "../../helper/FormHelper";
import { CustomerProductReportRequest } from "../../APIRequest/ReportAPIRequest";
import exportFromJSON from "export-from-json";
import moment from "moment";
import { NumericFormat as CurrencyFormat } from "react-number-format";

import {
  FacultyDropdownRequest,
  DepartmentDropdownRequest,
  SectionDropdownRequest,
} from "../../APIRequest/CustomerAPIRequest";
import { CustomerDropDownRequest } from "../../APIRequest/CustomerProductAPIRequest";

const CustomerProductReport = ({ userCategory }) => {
  const fromRef = useRef();
  const toRef = useRef();

  const DataList = useSelector(
    (state) => state.report.CustomerProductReportList
  );

  // State for dropdowns
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [customers, setCustomers] = useState([]);

  // State for filters
  const [selectedFilter, setSelectedFilter] = useState("date"); // date, faculty, department, section, customer
  const [selectedCategory, setSelectedCategory] = useState(""); // Only for customer filter
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");

  // Load faculties initially
  useEffect(() => {
    (async () => setFaculties(await FacultyDropdownRequest()))();
  }, []);

  // Load departments when faculty changes
  useEffect(() => {
    if (selectedFaculty) {
      (async () => setDepartments(await DepartmentDropdownRequest(selectedFaculty)))();
    } else {
      setDepartments([]);
      setSelectedDepartment("");
    }
  }, [selectedFaculty]);

  // Load all sections independently (not tied to faculty/department)
useEffect(() => {
  const fetchSections = async () => {
    const data = await SectionDropdownRequest(); // Fetch all sections
    setSections(data || []);
  };
  fetchSections();
}, []);


  // Load customers when filter is "customer" and hierarchy selected
  useEffect(() => {
    const fetchCustomers = async () => {
      if (selectedFilter !== "customer") return;

      let data = [];
      if (selectedCategory === "Dean" && selectedFaculty) {
        data = await CustomerDropDownRequest("Dean", selectedFaculty);
      } else if ((selectedCategory === "Chairman" || selectedCategory === "Teacher") && selectedFaculty && selectedDepartment) {
        data = await CustomerDropDownRequest(selectedCategory, selectedFaculty, selectedDepartment);
      } else if (selectedCategory === "Officer" && selectedSection) {
        data = await CustomerDropDownRequest("Officer", null, null, selectedSection);
      }
      setCustomers(data || []);
    };
    fetchCustomers();
  }, [selectedFilter, selectedCategory, selectedFaculty, selectedDepartment, selectedSection]);

  // Generate report
  const CreateReport = async () => {
    const fromDate = fromRef.current.value;
    const toDate = toRef.current.value;

    if (IsEmpty(fromDate)) return ErrorToast("From Date Required");
    if (IsEmpty(toDate)) return ErrorToast("To Date Required");

    // Convert to ISO format
    const fromDateISO = new Date(fromDate);
    const toDateISO = new Date(toDate);

    if (isNaN(fromDateISO) || isNaN(toDateISO)) return ErrorToast("Invalid date format");

    await CustomerProductReportRequest({
      FromDate: fromDateISO.toISOString(),
      ToDate: toDateISO.toISOString(),
      FacultyID: selectedFaculty || null,
      DepartmentID: selectedDepartment || null,
      SectionID: selectedSection || null,
      CustomerID: selectedCustomer || null,
    });
  };

  // Export report
  const OnExport = (exportType, data) => {
    const fileName = "CustomerProductReport";
    if (data.length > 0) {
      const ReportData = data.map((item) => ({
        "Purchase Date": moment(item.PurchaseDate).format("DD-MM-YYYY"),
        "Customer": item.CustomerName,
        "Product": item.Products.map((p) => p.ProductName).join(", "),
        "Qty": item.Products.map((p) => p.Qty).join(", "),
        "Unit Price": item.Products.map((p) => p.UnitPrice).join(", "),
        "Total": item.Total,
      }));
      exportFromJSON({ data: ReportData, fileName, exportType });
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">

        {/* Filters */}
        <div className="col-12 mb-3">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <h5>Customer Product Report</h5>
                <hr className="bg-light" />

                {/* Filter Type */}
                <div className="col-2 p-2">
                  <label>Filter By:</label>
                  <select
                    className="form-control form-control-sm"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  >
                    <option value="date">Date Only</option>
                    <option value="faculty">Faculty</option>
                    <option value="department">Department</option>
                    <option value="section">Section</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>

                {/* Always required date */}
                <div className="col-2 p-2">
                  <label>From Date:</label>
                  <input ref={fromRef} type="date" className="form-control form-control-sm" />
                </div>
                <div className="col-2 p-2">
                  <label>To Date:</label>
                  <input ref={toRef} type="date" className="form-control form-control-sm" />
                </div>

                {/* Conditional Filters */}
                {selectedFilter === "faculty" && (
                  <div className="col-2 p-2">
                    <label>Faculty:</label>
                    <select
                      className="form-control form-control-sm"
                      value={selectedFaculty}
                      onChange={(e) => setSelectedFaculty(e.target.value)}
                    >
                      <option value="">Select Faculty</option>
                      {faculties.map(f => <option key={f._id} value={f._id}>{f.Name}</option>)}
                    </select>
                  </div>
                )}

                {selectedFilter === "department" && (
                  <>
                    <div className="col-2 p-2">
                      <label>Faculty:</label>
                      <select
                        className="form-control form-control-sm"
                        value={selectedFaculty}
                        onChange={(e) => setSelectedFaculty(e.target.value)}
                      >
                        <option value="">Select Faculty</option>
                        {faculties.map(f => <option key={f._id} value={f._id}>{f.Name}</option>)}
                      </select>
                    </div>
                    <div className="col-2 p-2">
                      <label>Department:</label>
                      <select
                        className="form-control form-control-sm"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        disabled={!selectedFaculty}
                      >
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d._id} value={d._id}>{d.Name}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {/* Section filter (independent) */}
{selectedFilter === "section" && (
  <div className="col-2 p-2">
    <label>Section:</label>
    <select
      className="form-control form-control-sm"
      value={selectedSection}
      onChange={(e) => setSelectedSection(e.target.value)}
    >
      <option value="">Select Section</option>
      {sections.map((s) => (
        <option key={s._id} value={s._id}>
          {s.Name}
        </option>
      ))}
    </select>
  </div>
)}


                {/* Customer filter */}
                {selectedFilter === "customer" && (
                  <>
                    <div className="col-2 p-2">
                      <label>Category:</label>
                      <select
                        className="form-control form-control-sm"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="">Select Category</option>
                        <option value="Dean">Dean</option>
                        <option value="Chairman">Chairman</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Officer">Officer</option>
                      </select>
                    </div>

                    {/* Load relevant hierarchy for selected category */}
                    {selectedCategory === "Dean" && (
                      <div className="col-2 p-2">
                        <label>Faculty:</label>
                        <select
                          className="form-control form-control-sm"
                          value={selectedFaculty}
                          onChange={(e) => setSelectedFaculty(e.target.value)}
                        >
                          <option value="">Select Faculty</option>
                          {faculties.map(f => <option key={f._id} value={f._id}>{f.Name}</option>)}
                        </select>
                      </div>
                    )}

                    {(selectedCategory === "Chairman" || selectedCategory === "Teacher") && (
                      <>
                        <div className="col-2 p-2">
                          <label>Faculty:</label>
                          <select
                            className="form-control form-control-sm"
                            value={selectedFaculty}
                            onChange={(e) => setSelectedFaculty(e.target.value)}
                          >
                            <option value="">Select Faculty</option>
                            {faculties.map(f => <option key={f._id} value={f._id}>{f.Name}</option>)}
                          </select>
                        </div>
                        <div className="col-2 p-2">
                          <label>Department:</label>
                          <select
                            className="form-control form-control-sm"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            disabled={!selectedFaculty}
                          >
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.Name}</option>)}
                          </select>
                        </div>
                      </>
                    )}

                    {selectedCategory === "Officer" && (
                      <div className="col-2 p-2">
                        <label>Section:</label>
                        <select
                          className="form-control form-control-sm"
                          value={selectedSection}
                          onChange={(e) => setSelectedSection(e.target.value)}
                        >
                          <option value="">Select Section</option>
                          {sections.map(s => <option key={s._id} value={s._id}>{s.Name}</option>)}
                        </select>
                      </div>
                    )}

                    {/* Customer Dropdown */}
                    {(selectedCategory && ((selectedCategory === "Dean" && selectedFaculty) ||
                      ((selectedCategory === "Chairman" || selectedCategory === "Teacher") && selectedFaculty && selectedDepartment) ||
                      (selectedCategory === "Officer" && selectedSection))) && (
                      <div className="col-2 p-2">
                        <label>Customer:</label>
                        <select
                          className="form-control form-control-sm"
                          value={selectedCustomer}
                          onChange={(e) => setSelectedCustomer(e.target.value)}
                        >
                          <option value="">Select Customer</option>
                          {customers.map(c => <option key={c._id} value={c._id}>{c.CustomerName}</option>)}
                        </select>
                      </div>
                    )}
                  </>
                )}

              </div>

              {/* Generate Button */}
              <div className="row mt-2">
                <div className="col-2">
                  <button onClick={CreateReport} className="btn btn-sm btn-success">Generate Report</button>
                </div>
              </div>
            </div>
          </div>
        </div>

                {/* Report Table */}
        {DataList.length > 0 && (
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h6>
                  Total:{" "}
                  {DataList[0].Total?.[0]?.TotalAmount ? (
                    <CurrencyFormat
                      value={DataList[0].Total[0].TotalAmount}
                      displayType={"text"}
                      thousandSeparator={true}
                      prefix={"$ "}
                    />
                  ) : (
                    0
                  )}
                </h6>

                <div className="mb-2">
                  <button
                    onClick={() => OnExport("csv", DataList[0].Rows)}
                    className="btn btn-sm btn-success me-2"
                  >
                    Download CSV
                  </button>
                  <button
                    onClick={() => OnExport("xls", DataList[0].Rows)}
                    className="btn btn-sm btn-success"
                  >
                    Download XLS
                  </button>
                </div>

                {/* Table */}
                <div className="table-responsive">
                  <table className="table table-bordered table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>Purchase Date</th>
                        <th>Customer</th>
                        <th>Products</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DataList[0].Rows.map((row, index) => (
                        <tr key={index}>
                          <td>{moment(row.PurchaseDate).format("DD-MM-YYYY")}</td>
                          <td>{row.CustomerName}</td>
                          <td>{row.Products.map(p => p.ProductName).join(", ")}</td>
                          <td>{row.Products.map(p => p.Qty).join(", ")}</td>
                          <td>{row.Products.map(p => p.UnitPrice).join(", ")}</td>
                          <td>{row.Total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {DataList.length === 0 && (
          <div className="col-12">
            <div className="alert alert-info text-center">No data found for the selected filters.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProductReport;

