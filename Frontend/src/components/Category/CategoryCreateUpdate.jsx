import React, { useEffect, useState } from 'react';
import store from "../../redux/store/store";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ErrorToast, IsEmpty, SuccessToast } from "../../helper/FormHelper";
import { CreateCategoryRequest, FillCategoryFormRequest } from "../../APIRequest/CategoryAPIRequest";
import { OnChangeCategoryInput } from "../../redux/state-slice/category-slice";

const CategoryCreateUpdate = () => {
    const FormValue = useSelector((state) => state.category.FormValue);
    const navigate = useNavigate();
    const [ObjectID, SetObjectID] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategory = async () => {
            const id = new URLSearchParams(window.location.search).get('id');
            if (id) {
                SetObjectID(id);
                await FillCategoryFormRequest(id);
            }
        };
        fetchCategory();
    }, []);

    const handleInputChange = (name, value) => {
        store.dispatch(OnChangeCategoryInput({ Name: name, Value: value }));
    };

    const SaveChange = async () => {
        if (IsEmpty(FormValue.Name)) {
            ErrorToast("Category Name Required !");
            return;
        }

        setLoading(true);
        const success = await CreateCategoryRequest(FormValue, ObjectID);
        setLoading(false);

        console.log("CreateCategoryRequest success:", success); // debug

        if (success) {
            SuccessToast("Category saved successfully!");
            navigate("/CategoryListPage");
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <h5>{ObjectID ? "Update Category" : "Create Category"}</h5>
                            <hr className="bg-light" />
                            <div className="row">
                                <div className="col-4 p-2">
                                    <label className="form-label">Category Name</label>
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

export default CategoryCreateUpdate;
