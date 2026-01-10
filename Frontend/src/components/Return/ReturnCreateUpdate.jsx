import React, { Fragment, useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import store from "../../redux/store/store";
import {
  OnChangeReturnInput,
  SetReturnItemList,
  RemoveReturnItem,
  SetProductDropDown
} from "../../redux/state-slice/return-slice";
import {
  CustomerDropDownRequest,
  ProductDropDownRequest,
  CreateReturnRequest,
  FacultyDropdownRequest,
  DepartmentDropdownRequest,
  SectionDropdownRequest,
  SlipDropdownRequest
} from "../../APIRequest/ReturnAPIRequest";
import { BsCartCheck, BsTrash } from "react-icons/bs";
import { ErrorToast, IsEmpty } from "../../helper/FormHelper";

const ReturnCreateUpdate = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [category, setCategory] = useState("");
  const [slipList, setSlipList] = useState([]);

  const ReturnFormValue = useSelector(state => state.return.ReturnFormValue);
  const ReturnItemList = useSelector(state => state.return.ReturnItemList);
  const ProductDropDown = useSelector(state => state.return.ProductDropDown);

  const productRef = useRef();
  const qtyRef = useRef();

  // ---------------- Initial Load ----------------
  useEffect(() => {
    (async () => {
      const faculties = await FacultyDropdownRequest();
      setFacultyList(faculties);
    })();
  }, []);

  // ---------------- Category Change ----------------
  const onCategoryChange = async (value) => {
    setCategory(value);
    store.dispatch(OnChangeReturnInput({ Name: "Category", Value: value }));
    store.dispatch(OnChangeReturnInput({ Name: "FacultyID", Value: "" }));
    store.dispatch(OnChangeReturnInput({ Name: "DepartmentID", Value: "" }));
    store.dispatch(OnChangeReturnInput({ Name: "SectionID", Value: "" }));
    store.dispatch(OnChangeReturnInput({ Name: "CustomerID", Value: "" }));
    store.dispatch(OnChangeReturnInput({ Name: "SlipNo", Value: "" }));

    setDepartmentList([]);
    setSectionList([]);
    setCustomerList([]);
    setSlipList([]);
    store.dispatch(SetProductDropDown([]));

    if (value === "Officer") {
      const sections = await SectionDropdownRequest();
      setSectionList(sections);
    }
  };

  // ---------------- Faculty Change ----------------
  const onFacultyChange = async (facultyId) => {
    store.dispatch(OnChangeReturnInput({ Name: "FacultyID", Value: facultyId }));
    store.dispatch(OnChangeReturnInput({ Name: "DepartmentID", Value: "" }));
    store.dispatch(OnChangeReturnInput({ Name: "CustomerID", Value: "" }));
    store.dispatch(OnChangeReturnInput({ Name: "SlipNo", Value: "" }));

    setDepartmentList([]);
    setCustomerList([]);
    setSlipList([]);
    store.dispatch(SetProductDropDown([]));

    if (category === "Dean" && facultyId) {
      const customers = await CustomerDropDownRequest(category, facultyId, null, null);
      setCustomerList(customers);
    } else if (["Teacher", "Chairman"].includes(category) && facultyId) {
      const depts = await DepartmentDropdownRequest(facultyId);
      setDepartmentList(depts);
    }
  };

  // ---------------- Department Change ----------------
  const onDepartmentChange = async (deptId) => {
    store.dispatch(OnChangeReturnInput({ Name: "DepartmentID", Value: deptId }));
    store.dispatch(OnChangeReturnInput({ Name: "CustomerID", Value: "" }));
    store.dispatch(OnChangeReturnInput({ Name: "SlipNo", Value: "" }));

    setCustomerList([]);
    setSlipList([]);
    store.dispatch(SetProductDropDown([]));

    if (["Teacher", "Chairman"].includes(category) && ReturnFormValue.FacultyID && deptId) {
      const customers = await CustomerDropDownRequest(category, ReturnFormValue.FacultyID, deptId, null);
      setCustomerList(customers);
    }
  };

  // ---------------- Section Change ----------------
  const onSectionChange = async (sectionId) => {
    store.dispatch(OnChangeReturnInput({ Name: "SectionID", Value: sectionId }));
    store.dispatch(OnChangeReturnInput({ Name: "CustomerID", Value: "" }));
    store.dispatch(OnChangeReturnInput({ Name: "SlipNo", Value: "" }));

    setCustomerList([]);
    setSlipList([]);
    store.dispatch(SetProductDropDown([]));

    if (category === "Officer" && sectionId) {
      const customers = await CustomerDropDownRequest(category, null, null, sectionId);
      setCustomerList(customers);
    }
  };

  // ---------------- Customer Change ----------------
  const onCustomerChange = async (customerId) => {
    store.dispatch(OnChangeReturnInput({ Name: "CustomerID", Value: customerId }));
    store.dispatch(OnChangeReturnInput({ Name: "SlipNo", Value: "" }));
    store.dispatch(SetProductDropDown([]));
    setSlipList([]);

    if (!customerId) return;

    const slips = await SlipDropdownRequest(customerId);
    setSlipList(slips);
  };

  // ---------------- SlipNo Change ----------------
  const onSlipChange = async (slipNo) => {
    store.dispatch(OnChangeReturnInput({ Name: "SlipNo", Value: slipNo }));
    store.dispatch(SetProductDropDown([]));

    if (ReturnFormValue.CustomerID && slipNo) {
      await ProductDropDownRequest(ReturnFormValue.CustomerID, slipNo);
    }
  };

  // ---------------- Add Product Manually ----------------
  const OnAddCart = () => {
    const productName = productRef.current.value.trim();
    const qtyValue = parseInt(qtyRef.current.value, 10);

    if (IsEmpty(productName)) return ErrorToast("Enter Product Name");
    if (!qtyValue || qtyValue <= 0) return ErrorToast("Qty Required");

    const newItem = { ProductName: productName, Qty: qtyValue };
    store.dispatch(SetReturnItemList(newItem));

    productRef.current.value = "";
    qtyRef.current.value = "";
  };

  const removeCart = (index) => {
    store.dispatch(RemoveReturnItem(index));
  };

  // ---------------- Create Return ----------------
  const CreateNewReturn = async () => {
    if (!ReturnFormValue.CustomerID) return ErrorToast("Select Customer");
    if (!ReturnFormValue.SlipNo) return ErrorToast("Select SlipNo");
    if (ReturnItemList.length === 0) return ErrorToast("Add at least one product");
    if (!ReturnFormValue.GivenDate) return ErrorToast("Select Sale Date");

    const res = await CreateReturnRequest(ReturnFormValue, ReturnItemList);
    if (res) alert("Return Created Successfully");
  };

  return (
    <Fragment>
      <div className="container-fluid">
        <div className="row">

          {/* Left Form */}
          <div className="col-12 col-md-4 col-lg-4 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <h5>Create Return</h5>
                <hr />

                {/* Category */}
                <div className="mb-2">
                  <label className="form-label">Category</label>
                  <select className="form-select form-select-sm" value={category} onChange={(e) => onCategoryChange(e.target.value)}>
                    <option value="">Select Category</option>
                    <option value="Dean">Dean</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Chairman">Chairman</option>
                    <option value="Officer">Officer</option>
                  </select>
                </div>

                {/* Faculty */}
                {["Dean", "Teacher", "Chairman"].includes(category) && (
                  <div className="mb-2">
                    <label className="form-label">Faculty</label>
                    <select className="form-select form-select-sm" onChange={(e) => onFacultyChange(e.target.value)}>
                      <option value="">Select Faculty</option>
                      {facultyList.map(f => <option key={f._id} value={f._id}>{f.Name}</option>)}
                    </select>
                  </div>
                )}

                {/* Department */}
                {["Teacher", "Chairman"].includes(category) && departmentList.length > 0 && (
                  <div className="mb-2">
                    <label className="form-label">Department</label>
                    <select className="form-select form-select-sm" onChange={(e) => onDepartmentChange(e.target.value)}>
                      <option value="">Select Department</option>
                      {departmentList.map(d => <option key={d._id} value={d._id}>{d.Name}</option>)}
                    </select>
                  </div>
                )}

                {/* Section */}
                {category === "Officer" && sectionList.length > 0 && (
                  <div className="mb-2">
                    <label className="form-label">Section</label>
                    <select className="form-select form-select-sm" onChange={(e) => onSectionChange(e.target.value)}>
                      <option value="">Select Section</option>
                      {sectionList.map(s => <option key={s._id} value={s._id}>{s.Name}</option>)}
                    </select>
                  </div>
                )}

                {/* Customer */}
                {customerList.length > 0 && (
                  <div className="mb-2">
                    <label className="form-label">Customer</label>
                    <select className="form-select form-select-sm" value={ReturnFormValue.CustomerID || ""} onChange={(e) => onCustomerChange(e.target.value)}>
                      <option value="">Select Customer</option>
                      {customerList.map(c => <option key={c._id} value={c._id}>{c.CustomerName}</option>)}
                    </select>
                  </div>
                )}

                {/* SlipNo */}
                {slipList.length > 0 && (
                  <div className="mb-2">
                    <label className="form-label">SlipNo</label>
                    <select className="form-select form-select-sm" value={ReturnFormValue.SlipNo || ""} onChange={(e) => onSlipChange(e.target.value)}>
                      <option value="">Select SlipNo</option>
                      {slipList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {/* Sale Date */}
                <div className="mb-2">
                  <label className="form-label">Sale Date</label>
                  <input type="date" className="form-control form-control-sm" value={ReturnFormValue.GivenDate || ""} onChange={(e) => store.dispatch(OnChangeReturnInput({ Name: "GivenDate", Value: e.target.value }))} />
                </div>

                {/* Reason */}
                <div className="mb-2">
                  <label className="form-label">Reason</label>
                  <input type="text" className="form-control form-control-sm" value={ReturnFormValue.Reason || ""} onChange={(e) => store.dispatch(OnChangeReturnInput({ Name: "Reason", Value: e.target.value }))} />
                </div>

                <button className="btn btn-sm btn-success mt-2" onClick={CreateNewReturn}>Create</button>
              </div>
            </div>
          </div>

          {/* Right Product Cart */}
          <div className="col-12 col-md-8 col-lg-8 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="row mb-2">
                  <div className="col-8">
                    <label className="form-label">Product Name</label>
                    <select ref={productRef} className="form-select form-select-sm">
                      <option value="">Select Product</option>
                      {ProductDropDown.map(p => (
                        <option key={p._id} value={p.ProductName}>
                          {p.ProductName} (Stock: {p.Stock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-2">
                    <label className="form-label">Qty</label>
                    <input ref={qtyRef} type="number" min={1} className="form-control form-control-sm" />
                  </div>
                  <div className="col-2 d-flex align-items-end">
                    <button onClick={OnAddCart} className="btn btn-success btn-sm w-100">
                      <BsCartCheck />
                    </button>
                  </div>
                </div>

                {/* Cart Table */}
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead>
                      <tr className="table-light">
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ReturnItemList.length > 0 ? ReturnItemList.map((item, i) => (
                        <tr key={i}>
                          <td>{item.ProductName}</td>
                          <td>{item.Qty}</td>
                          <td>
                            <button onClick={() => removeCart(i)} className="btn btn-outline-danger btn-sm">
                              <BsTrash />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="3" className="text-center text-muted">No items added</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </Fragment>
  );
};

export default ReturnCreateUpdate;

