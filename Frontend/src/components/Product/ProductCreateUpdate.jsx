import React, { useEffect, useState } from 'react';
import store from "../../redux/store/store";
import {
    CreateProductRequest,
    FillProductFormRequest,
    ProductBrandDropDownRequest,
    ProductCategoryDropDownRequest
} from "../../APIRequest/ProductAPIRequest";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { OnChangeProductInput } from "../../redux/state-slice/product-slice";
import { ErrorToast, IsEmpty } from "../../helper/FormHelper";

const ProductCreateUpdate = () => {

    let FormValue = useSelector((state) => state.product.FormValue);
    let navigate = useNavigate();
    let [ObjectID, SetObjectID] = useState(0);

    useEffect(() => {
        (async () => {
            await ProductBrandDropDownRequest();
            await ProductCategoryDropDownRequest();
        })();

        let params = new URLSearchParams(window.location.search);
        let id = params.get('id');
        if (id !== null) {
            SetObjectID(id);
            (async () => {
                await FillProductFormRequest(id)
            })();
        }

    }, []);

    let ProductBrandDropDown = useSelector((state) => state.product.ProductBrandDropDown);
    let ProductCategoryDropDown = useSelector((state) => state.product.ProductCategoryDropDown);

    const SaveChange = async () => {
        if (IsEmpty(FormValue.Name)) return ErrorToast("Product Name Required!");
        if (IsEmpty(FormValue.BrandID)) return ErrorToast("Product Brand Required!");
        if (IsEmpty(FormValue.CategoryID)) return ErrorToast("Product Category Required!");

        const success = await CreateProductRequest(FormValue, ObjectID);
        if (success) {
            // Navigate to Purchase Create/Update page after product creation
            navigate("/PurchaseCreateUpdatePage");
        }
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="row">
                                <h5>Save Product Type</h5>
                                <hr className="bg-light" />

                                <div className="col-4 p-2">
                                    <label className="form-label">Product Name</label>
                                    <input
                                        onChange={(e) => store.dispatch(OnChangeProductInput({ Name: "Name", Value: e.target.value }))}
                                        value={FormValue.Name}
                                        className="form-control form-control-sm"
                                        type="text"
                                    />
                                </div>

                                <div className="col-4 p-2">
                                    <label className="form-label">Product Brand</label>
                                    <select
                                        onChange={(e) => store.dispatch(OnChangeProductInput({ Name: "BrandID", Value: e.target.value }))}
                                        value={FormValue.BrandID}
                                        className="form-select form-select-sm"
                                    >
                                        <option value="">Select Brand</option>
                                        {ProductBrandDropDown.map((item, i) => (
                                            <option key={i.toLocaleString()} value={item._id}>{item.Name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-4 p-2">
                                    <label className="form-label">Product Category</label>
                                    <select
                                        onChange={(e) => store.dispatch(OnChangeProductInput({ Name: "CategoryID", Value: e.target.value }))}
                                        value={FormValue.CategoryID}
                                        className="form-select form-select-sm"
                                    >
                                        <option value="">Select Category</option>
                                        {ProductCategoryDropDown.map((item, i) => (
                                            <option key={i.toLocaleString()} value={item._id}>{item.Name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-4 p-2">
                                    <label className="form-label">Details</label>
                                    <input
                                        onChange={(e) => store.dispatch(OnChangeProductInput({ Name: "Details", Value: e.target.value }))}
                                        value={FormValue.Details}
                                        className="form-control form-control-sm"
                                        type="text"
                                    />
                                </div>

                            </div>
                            <div className="row">
                                <div className="col-4 p-2">
                                    <button onClick={SaveChange} className="btn btn-sm my-3 btn-success">Save Change</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCreateUpdate;
