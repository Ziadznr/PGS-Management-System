import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

import {
  OnChangeHallInput,
  ResetHallFormValue
} from "../../redux/state-slice/hall-slice";

import {
  CreateHallRequest,
  FillHallFormRequest
} from "../../APIRequest/HallAPIRequest";

import { ErrorToast, IsEmpty, SuccessToast } from "../../helper/FormHelper";

const HallCreateUpdate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const FormValue = useSelector((state) => state.hall.FormValue);

  const [ObjectID, setObjectID] = useState(0);
  const [loading, setLoading] = useState(false);

/* ================= LOAD FOR EDIT ================= */
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  const loadData = async () => {
    // EDIT MODE
    if (id && id !== "null" && id !== "undefined") {
      setObjectID(id);
      await FillHallFormRequest(id); // ✅ MUST await
      return;
    }

    // CREATE MODE
    setObjectID(0);
    dispatch(ResetHallFormValue());
  };

  loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [location.search]);



  /* ================= INPUT ================= */
  const handleChange = (name, value) => {
    dispatch(OnChangeHallInput({ Name: name, Value: value }));
  };

  /* ================= SAVE ================= */
  const SaveChange = async () => {
    if (IsEmpty(FormValue.name)) {
      ErrorToast("Hall name required");
      return;
    }

    if (IsEmpty(FormValue.code)) {
      ErrorToast("Hall code required");
      return;
    }

    if (ObjectID) {
      const confirm = await Swal.fire({
        title: "Confirm Update",
        text: "Are you sure you want to update this hall?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#198754",
        cancelButtonColor: "#dc3545",
        confirmButtonText: "Yes, Update"
      });

      if (!confirm.isConfirmed) return;
    }

    setLoading(true);

    const payload = {
      _id: ObjectID || undefined,
      name: FormValue.name,
      code: FormValue.code,
      description: FormValue.description
    };

    const success = await CreateHallRequest(payload, ObjectID);
    setLoading(false);

    if (success) {
      SuccessToast(
        ObjectID
          ? "Hall updated successfully"
          : "Hall created successfully"
      );
      navigate("/HallListPage");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container-fluid">
      <div className="card shadow-sm">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center">
            <h5 className="fw-bold">
              {ObjectID ? "Update Hall" : "Create Hall"}
            </h5>

            {ObjectID && (
              <span className="badge bg-info">
                Edit Mode
              </span>
            )}
          </div>

          <hr />

          {/* HALL NAME */}
          <div className="mb-3 col-md-4">
            <label className="form-label fw-bold">Hall Name</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Bangabandhu Hall"
              value={FormValue.name || ""}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
            />
          </div>

          {/* HALL CODE */}
          <div className="mb-3 col-md-3">
            <label className="form-label fw-bold">Hall Code</label>
            <input
              type="text"
              className="form-control form-control-sm text-uppercase"
              placeholder="e.g. BBH"
              value={FormValue.code || ""}
              onChange={(e) =>
                handleChange("code", e.target.value.toUpperCase())
              }
            />
            <small className="text-muted">
              Must be unique (used internally)
            </small>
          </div>

          {/* DESCRIPTION */}
          {/* <div className="mb-3 col-md-6">
            <label className="form-label fw-bold">Description</label>
            <textarea
              className="form-control form-control-sm"
              rows="3"
              placeholder="Optional description about this hall"
              value={FormValue.description || ""}
              onChange={(e) =>
                handleChange("description", e.target.value)
              }
            />
          </div> */}

          {/* SAVE */}
          <button
            onClick={SaveChange}
            className="btn btn-sm btn-success mt-3"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default HallCreateUpdate;
