import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CreateBrandRequest, FillBrandFormRequest } from "../../APIRequest/BrandAPIRequest";
import { ErrorToast, IsEmpty, SuccessToast } from "../../helper/FormHelper";
import store from "../../redux/store/store";
import { OnChangeBrandInput } from "../../redux/state-slice/brand-slice";

const BrandCreateUpdate = () => {
    const FormValue = useSelector((state) => state.brand.FormValue);
    const navigate = useNavigate();
    const [ObjectID, SetObjectID] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBrand = async () => {
            const id = new URLSearchParams(window.location.search).get('id');
            if (id) {
                SetObjectID(id);
                await FillBrandFormRequest(id);
            }
        };
        fetchBrand();
    }, []);

    const handleInputChange = (name, value) => {
        store.dispatch(OnChangeBrandInput({ Name: name, Value: value }));
    };

    const SaveChange = async () => {
        if (IsEmpty(FormValue.Name)) {
            ErrorToast("Brand Name Required !");
            return;
        }

        setLoading(true);
        const success = await CreateBrandRequest(FormValue, ObjectID);
        setLoading(false);

        console.log("CreateBrandRequest success:", success); // debug

        if (success) {
            SuccessToast("Brand saved successfully!");
            navigate("/BrandListPage"); // navigate after success
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <h5>{ObjectID ? "Update Brand" : "Create Brand"}</h5>
                            <hr className="bg-light" />
                            <div className="row">
                                <div className="col-4 p-2">
                                    <label className="form-label">Brand Name</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={FormValue.Name}
                                        onChange={(e) => handleInputChange("Name", e.target.value)}
                                        disabled={loading}
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

export default BrandCreateUpdate;
