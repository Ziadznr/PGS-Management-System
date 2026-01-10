// src/components/Department/DepartmentCreateUpdate.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  OnChangeDepartmentInput,
  ResetDepartmentFormValue,
} from "../../redux/state-slice/department-slice";
import { FacultyDropDownRequest } from "../../APIRequest/DepartmentAPIRequest";
import {
  CreateDepartmentRequest,
  FillDepartmentFormRequest,
} from "../../APIRequest/DepartmentAPIRequest";
import { ErrorToast, IsEmpty, SuccessToast } from "../../helper/FormHelper";

const DepartmentCreateUpdate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const FormValue = useSelector((state) => state.department.FormValue);
  const FacultyDropdown = useSelector((state) => state.faculty.DropDown);

  const [ObjectID, SetObjectID] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch department if editing
  useEffect(() => {
    const fetchDepartment = async () => {
      const id = new URLSearchParams(window.location.search).get("id");
      if (id) {
        SetObjectID(id);
        await FillDepartmentFormRequest(id);
      } else {
        dispatch(ResetDepartmentFormValue());
      }
    };
    fetchDepartment();
  }, [dispatch]);

  // Fetch faculty dropdown
  useEffect(() => {
    FacultyDropDownRequest();
  }, []);

  // Input handler
  const handleInputChange = (name, value) => {
    dispatch(OnChangeDepartmentInput({ Name: name, Value: value }));
  };

  // Save (create or update)
  const SaveChange = async () => {
    if (IsEmpty(FormValue.FacultyID)) {
      ErrorToast("Please select a Faculty!");
      return;
    }
    if (IsEmpty(FormValue.Name)) {
      ErrorToast("Department Name Required!");
      return;
    }

    setLoading(true);
    const success = await CreateDepartmentRequest(
      { Name: FormValue.Name, FacultyID: FormValue.FacultyID },
      ObjectID
    );
    setLoading(false);

    if (success) {
      SuccessToast("Department saved successfully!");
      navigate("/department-list");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5>{ObjectID ? "Update Department" : "Create Department"}</h5>
              <hr className="bg-light" />

              <div className="row">
                {/* Faculty Dropdown */}
                <div className="col-4 p-2">
                  <label className="form-label">Select Faculty</label>
                  <select
                    className="form-select form-select-sm"
                    value={FormValue.FacultyID}
                    onChange={(e) => handleInputChange("FacultyID", e.target.value)}
                  >
                    <option value="">-- Select Faculty --</option>
                    {FacultyDropdown.map((faculty) => (
                      <option key={faculty._id} value={faculty._id}>
                        {faculty.Name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Name */}
                <div className="col-4 p-2">
                  <label className="form-label">Department Name</label>
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

export default DepartmentCreateUpdate;
