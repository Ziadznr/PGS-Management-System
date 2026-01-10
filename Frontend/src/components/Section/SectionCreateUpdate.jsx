// src/components/Section/SectionCreateUpdate.js
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
import store from "../../redux/store/store";
import { OnChangeSectionInput } from "../../redux/state-slice/section-slice";
import {
  CreateSectionRequest,
  FillSectionFormRequest,
} from "../../APIRequest/SectionAPIRequest";
import { ErrorToast, IsEmpty, SuccessToast } from "../../helper/FormHelper";

const SectionCreateUpdate = ({ onSaveSuccess }) => {  // <-- accept callback
  const FormValue = useSelector((state) => state.section.FormValue);
//   const navigate = useNavigate();
  const [ObjectID, SetObjectID] = useState(0);
  const [loading, setLoading] = useState(false);

  // Check if editing (get id from query params)
  useEffect(() => {
    const fetchSection = async () => {
      const id = new URLSearchParams(window.location.search).get("id");
      if (id) {
        SetObjectID(id);
        await FillSectionFormRequest(id);
      }
    };
    fetchSection();
  }, []);

  // Input handler
  const handleInputChange = (name, value) => {
    store.dispatch(OnChangeSectionInput({ Name: name, Value: value }));
  };

  // Save (create or update)
  const SaveChange = async () => {
    if (IsEmpty(FormValue.Name)) {
      ErrorToast("Section Name Required!");
      return;
    }

    setLoading(true);
    const success = await CreateSectionRequest({ Name: FormValue.Name }, ObjectID);
    setLoading(false);

    console.log("CreateSectionRequest success:", success); // debug

    if (success) {
      SuccessToast("Section saved successfully!");
      
      // Refresh the list if callback provided
      if (onSaveSuccess) onSaveSuccess();

      // Reset form if creating new
      if (!ObjectID) store.dispatch(OnChangeSectionInput({ Name: "Name", Value: "" }));

      // Optionally navigate back
      // navigate("/SectionOperationPage");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5>{ObjectID ? "Update Section" : "Create Section"}</h5>
              <hr className="bg-light" />

              <div className="row">
                <div className="col-4 p-2">
                  <label className="form-label">Section Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={FormValue.Name}
                    onChange={(e) => handleInputChange("Name", e.target.value)}
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

export default SectionCreateUpdate;
