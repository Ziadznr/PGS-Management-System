import React, { Fragment, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { BsCartCheck, BsTrash } from "react-icons/bs";
import { ErrorToast, IsEmpty } from "../../helper/FormHelper";
import { 
    OnChangePurchaseInput, 
    RemovePurchaseItem, 
    SetPurchaseItemList 
} from "../../redux/state-slice/purchase-slice";
import { CreatePurchaseRequest, ProductDropDownRequest, SupplierDropDownRequest } from "../../APIRequest/PurchaseAPIRequest";

const PurchaseCreateUpdate = () => {
    const dispatch = useDispatch();

    // Refs
    const productRef = useRef();
    const qtyRef = useRef();
    const unitPriceRef = useRef();

    // Redux state
    const SupplierDropDown = useSelector((state) => state.purchase.SupplierDropDown);
    const ProductDropDown = useSelector((state) => state.purchase.ProductDropDown);
    const PurchaseItemList = useSelector((state) => state.purchase.PurchaseItemList);
    const PurchaseFormValue = useSelector((state) => state.purchase.PurchaseFormValue);

    // Load dropdowns on mount
    useEffect(() => {
        (async () => {
            await ProductDropDownRequest();
            await SupplierDropDownRequest();
        })();
    }, []);

    // Add item to cart
    const OnAddCart = () => {
        const productValue = productRef.current.value;
        const productName = productRef.current.selectedOptions[0]?.text || "";
        const qtyValue = parseFloat(qtyRef.current.value);
        const unitPriceValue = parseFloat(unitPriceRef.current.value);

        if (IsEmpty(productValue)) return ErrorToast("Select Product");
        if (isNaN(qtyValue) || qtyValue <= 0) return ErrorToast("Qty Required");
        if (isNaN(unitPriceValue) || unitPriceValue <= 0) return ErrorToast("Unit Price Required");

        const item = {
            ProductID: productValue,
            ProductName: productName,
            Qty: qtyValue,
            UnitCost: unitPriceValue,
            GrandTotal: qtyValue * unitPriceValue
        };

        dispatch(SetPurchaseItemList([...PurchaseItemList, item]));

        // Clear inputs
        productRef.current.value = "";
        qtyRef.current.value = "";
        unitPriceRef.current.value = "";
    };

    // Remove item from cart
    const removeCart = (index) => {
        dispatch(RemovePurchaseItem(index));
    };

    // Handle parent form input changes
    const handleInputChange = (e, field) => {
        const value = e.target.value;
        dispatch(OnChangePurchaseInput({ Name: field, Value: value }));
    };

    // Calculate grand total dynamically
    const calculateGrandTotal = () => {
        const totalItems = PurchaseItemList.reduce((sum, item) => sum + (item.GrandTotal || 0), 0);
        const vatAmount = totalItems * ((parseFloat(PurchaseFormValue.VatTax) || 0) / 100);
        const discountAmount = totalItems * ((parseFloat(PurchaseFormValue.Discount) || 0) / 100);
        const other = parseFloat(PurchaseFormValue.OtherCost) || 0;
        const shipping = parseFloat(PurchaseFormValue.ShippingCost) || 0;
        return (totalItems + vatAmount - discountAmount + other + shipping).toFixed(2);
    };

    // Create purchase
    const CreateNewPurchase = async () => {
        if (PurchaseItemList.length === 0) return ErrorToast("Cart is empty");
        const payload = {
            ...PurchaseFormValue,
            GrandTotal: parseFloat(calculateGrandTotal())
        };
        const res = await CreatePurchaseRequest(payload, PurchaseItemList);
        console.log("Purchase Create Result:", res);
    };

    return (
        <Fragment>
            <div className="container-fluid">
                <div className="row">

                    {/* Purchase Form */}
                    <div className="col-12 col-md-4 col-lg-4 mb-3">
                        <div className="card h-100">
                            <div className="card-body">
                                <h5>Create Purchase</h5>
                                <hr className="bg-light"/>
                                <div className="row">
                                    <div className="col-12 p-1">
                                        <label className="form-label">Supplier</label>
                                        <select
                                            onChange={(e) => handleInputChange(e, "SupplierID")}
                                            className="form-select form-select-sm"
                                        >
                                            <option value="">Select Supplier</option>
                                            {SupplierDropDown.map((item) => (
                                                <option key={item._id} value={item._id}>{item.Name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {["VatTax", "Discount", "OtherCost", "ShippingCost"].map((field) => (
                                        <div className="col-12 p-1" key={field}>
                                            <label className="form-label">{field}</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                value={PurchaseFormValue[field] || ""}
                                                onChange={(e) => handleInputChange(e, field)}
                                            />
                                        </div>
                                    ))}

                                    <div className="col-12 p-1">
                                        <label className="form-label">Grand Total</label>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            value={calculateGrandTotal()}
                                            readOnly
                                        />
                                    </div>

                                    <div className="col-12 p-1">
                                        <label className="form-label">Note</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            value={PurchaseFormValue.Note || ""}
                                            onChange={(e) => handleInputChange(e, "Note")}
                                        />
                                    </div>

                                    <div className="col-12 p-2">
                                        <button onClick={CreateNewPurchase} className="btn btn-success btn-sm w-100">Create</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cart Section */}
                    <div className="col-12 col-md-8 col-lg-8 mb-3">
                        <div className="card h-100">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-6 p-1">
                                        <label className="form-label">Select Product</label>
                                        <select ref={productRef} className="form-select form-select-sm">
                                            <option value="">Select Product</option>
                                            {ProductDropDown.map((item) => (
                                                <option key={item._id} value={item._id}>{item.Name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-2 p-1">
                                        <label className="form-label">Qty</label>
                                        <input ref={qtyRef} className="form-control form-control-sm" type="number"/>
                                    </div>

                                    <div className="col-2 p-1">
                                        <label className="form-label">Unit Price</label>
                                        <input ref={unitPriceRef} className="form-control form-control-sm" type="number"/>
                                    </div>

                                    <div className="col-2 p-1">
                                        <label className="form-label">Add</label>
                                        <button onClick={OnAddCart} className="btn btn-success btn-sm w-100"><BsCartCheck/></button>
                                    </div>
                                </div>

                                <div className="row mt-3">
                                    <div className="col-12 table-responsive">
                                        <table className="table table-sm text-center">
                                            <thead className="bg-light sticky-top">
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Qty</th>
                                                    <th>Unit Price</th>
                                                    <th>Total</th>
                                                    <th>Remove</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {PurchaseItemList.map((item, i) => (
                                                    <tr key={i}>
                                                        <td>{item.ProductName}</td>
                                                        <td>{item.Qty}</td>
                                                        <td>{item.UnitCost}</td>
                                                        <td>{item.GrandTotal}</td>
                                                        <td>
                                                            <button onClick={() => removeCart(i)} className="btn btn-outline-danger btn-sm"><BsTrash/></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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

export default PurchaseCreateUpdate;
