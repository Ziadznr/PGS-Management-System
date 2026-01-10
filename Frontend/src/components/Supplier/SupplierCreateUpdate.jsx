import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import store from "../../redux/store/store";
import { OnChangeSupplierInput } from "../../redux/state-slice/supplier-slice";
import { CreateSupplierRequest, FillSupplierFormRequest } from "../../APIRequest/SupplierAPIRequest";
import { ErrorToast, IsEmail, IsEmpty, SuccessToast } from "../../helper/FormHelper";
import { useNavigate } from "react-router-dom";

const SupplierCreateUpdate = () => {
    const FormValue = useSelector((state) => state.supplier.FormValue);
    const navigate = useNavigate();
    const [ObjectID, SetObjectID] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSupplier = async () => {
            const id = new URLSearchParams(window.location.search).get('id');
            if (id) {
                SetObjectID(id);
                await FillSupplierFormRequest(id);
            }
        };
        fetchSupplier();
    }, []);

    const handleInputChange = (name, value) => {
        store.dispatch(OnChangeSupplierInput({ Name: name, Value: value }));
    };

    const SaveChange = async () => {
        if (IsEmpty(FormValue.Name)) {
            ErrorToast("Supplier Name Required !");
            return;
        }
        if (IsEmpty(FormValue.Phone)) {
            ErrorToast("Supplier Phone Number Required !");
            return;
        }
        if (!IsEmail(FormValue.Email)) {
            ErrorToast("Valid Email Address Required !");
            return;
        }

        setLoading(true);
        const success = await CreateSupplierRequest(FormValue, ObjectID);
        setLoading(false);

        if (success) {
            SuccessToast("Supplier saved successfully!");
            navigate("/SupplierListPage");
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <h5>{ObjectID ? "Update Supplier" : "Create Supplier"}</h5>
                            <hr className="bg-light" />

                            <div className="row">
                                <div className="col-4 p-2">
                                    <label className="form-label">Supplier Name</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={FormValue.Name}
                                        onChange={(e) => handleInputChange("Name", e.target.value)}
                                    />
                                </div>
                                <div className="col-4 p-2">
                                    <label className="form-label">Mobile No</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={FormValue.Phone}
                                        onChange={(e) => handleInputChange("Phone", e.target.value)}
                                    />
                                </div>
                                <div className="col-4 p-2">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={FormValue.Email}
                                        onChange={(e) => handleInputChange("Email", e.target.value)}
                                    />
                                </div>
                                <div className="col-12 p-2">
                                    <label className="form-label">Address</label>
                                    <textarea
                                        className="form-control form-control-sm"
                                        rows={4}
                                        value={FormValue.Address}
                                        onChange={(e) => handleInputChange("Address", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-4 p-2">
                                    <button
                                        type="button"
                                        onClick={SaveChange}
                                        className="btn btn-sm my-3 btn-success"
                                        disabled={loading}
                                    >
                                        {loading ? "Saving..." : "Save Change"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierCreateUpdate;
