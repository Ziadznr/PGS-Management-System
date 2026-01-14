import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

import {
  OnChangeDepartmentInput,
  ResetDepartmentFormValue,
} from "../../redux/state-slice/department-slice";

import {
  CreateDepartmentRequest,
  FillDepartmentFormRequest,
} from "../../APIRequest/DepartmentAPIRequest";

import { ErrorToast, IsEmpty, SuccessToast } from "../../helper/FormHelper";

const DepartmentCreateUpdate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const FormValue = useSelector((state) => state.department.FormValue);

  const [ObjectID, setObjectID] = useState(0);
  const [loading, setLoading] = useState(false);

  // ---------------- LOAD FOR EDIT (SAFE) ----------------
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");

    const loadData = async () => {
      if (id && id !== "null" && id !== "undefined") {
        setObjectID(id);
        await FillDepartmentFormRequest(id);
      } else {
        setObjectID(0);
        dispatch(ResetDepartmentFormValue());
      }
    };

    loadData();
  }, [location.search, dispatch]);

  // ---------------- INPUT ----------------
  const handleInputChange = (value) => {
    dispatch(OnChangeDepartmentInput({ Name: "Name", Value: value }));
  };

  // ---------------- SAVE ----------------
  const SaveChange = async () => {
    if (IsEmpty(FormValue.Name)) {
      ErrorToast("Department Name Required!");
      return;
    }

    if (ObjectID) {
      const confirm = await Swal.fire({
        title: "Confirm Update",
        text: "Are you sure you want to update this department?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#198754",
        cancelButtonColor: "#dc3545",
        confirmButtonText: "Yes, Update",
      });

      if (!confirm.isConfirmed) return;
    }

    setLoading(true);

    const success = await CreateDepartmentRequest(
      { name: FormValue.Name },
      ObjectID
    );

    setLoading(false);

    if (success) {
      SuccessToast(
        ObjectID
          ? "Department Updated Successfully!"
          : "Department Created Successfully!"
      );
      navigate("/department-list");
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">

          <h5>{ObjectID ? "Update Department" : "Create Department"}</h5>
          <hr />

          {/* STATIC FACULTY */}
          <div className="mb-3">
            <label className="form-label fw-bold">Faculty</label>
            <div className="form-control form-control-sm bg-light">
              PGS
            </div>
          </div>

          {/* DEPARTMENT NAME */}
          <div className="mb-3 col-4">
            <label className="form-label">Department Name</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={FormValue.Name || ""}
              onChange={(e) => handleInputChange(e.target.value)}
            />
          </div>

          <button
            onClick={SaveChange}
            className="btn btn-sm btn-success"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default DepartmentCreateUpdate;
