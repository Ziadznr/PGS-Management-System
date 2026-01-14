import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import store from "../../redux/store/store";
import { OnChangeFacultyInput } from "../../redux/state-slice/faculty-slice";
import {
  CreateFacultyRequest,
  FillFacultyFormRequest
} from "../../APIRequest/FacultyAPIRequest";
import { ErrorToast, IsEmpty, SuccessToast } from "../../helper/FormHelper";
import Swal from "sweetalert2";

const FacultyCreateUpdate = () => {
  const FormValue = useSelector((state) => state.faculty.FormValue);

  const [searchParams] = useSearchParams();
  const facultyId = searchParams.get("id");

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= LOAD FACULTY (EDIT MODE) =================
  useEffect(() => {
    const init = async () => {
      if (facultyId) {
        const success = await FillFacultyFormRequest(facultyId);
        if (!success) {
          ErrorToast("Failed to load faculty data");
        }
      } else {
        store.dispatch(
          OnChangeFacultyInput({ name: "Name", Value: "" })
        );
      }
    };
    init();
  }, [facultyId]);

  // ================= CREATE FACULTY =================
  const createFaculty = async () => {
    if (IsEmpty(FormValue.name)) {
      ErrorToast("Faculty Name Required!");
      return;
    }

    setLoading(true);
    const success = await CreateFacultyRequest(
      { name: FormValue.name },
      0
    );
    setLoading(false);

    if (success) {
      SuccessToast("Faculty Created Successfully");
    }
  };

  // ================= UPDATE FACULTY =================
  const updateFaculty = async () => {
    if (IsEmpty(FormValue.name)) {
      ErrorToast("Faculty Name Required!");
      return;
    }

    const confirm = await Swal.fire({
      title: "Update Faculty?",
      text: "This change will apply across all departments.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Update"
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    const success = await CreateFacultyRequest(
      { name: FormValue.name },
      facultyId
    );
    setLoading(false);

    if (success) {
      SuccessToast("Faculty Updated Successfully");
      setIsEditMode(false);
    }
  };

  // ================= UI =================
  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">

          <h5>{facultyId ? "Update Faculty" : "Create Faculty"}</h5>
          <hr />

          <div className="col-md-4">
            <label className="form-label">Faculty Name</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={FormValue.name || ""}
              readOnly={facultyId && !isEditMode}
              onChange={(e) =>
                store.dispatch(
                  OnChangeFacultyInput({
                    Name: "Name",
                    Value: e.target.value
                  })
                )
              }
            />
          </div>

          <div className="mt-3">
            {/* CREATE */}
            {!facultyId && (
              <button
                className="btn btn-sm btn-success"
                onClick={createFaculty}
                disabled={loading}
              >
                Create Faculty
              </button>
            )}

            {/* EDIT */}
            {facultyId && !isEditMode && (
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setIsEditMode(true)}
              >
                Edit
              </button>
            )}

            {/* UPDATE */}
            {facultyId && isEditMode && (
              <>
                <button
                  className="btn btn-sm btn-success me-2"
                  onClick={updateFaculty}
                  disabled={loading}
                >
                  Update
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setIsEditMode(false)}
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          <p className="text-muted mt-3">
            Faculty updates affect all associated departments.
          </p>

        </div>
      </div>
    </div>
  );
};

export default FacultyCreateUpdate;
