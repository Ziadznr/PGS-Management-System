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

const PROGRAMS = ["MS", "MBA", "PhD", "LLM", "MPhil"];

const DepartmentCreateUpdate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const FormValue = useSelector((state) => state.department.FormValue);

  const [ObjectID, setObjectID] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ================= SUBJECT STATE ================= */
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");

  /* ================= LOAD FOR EDIT ================= */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");

    const loadData = async () => {
      if (id && id !== "null" && id !== "undefined") {
        setObjectID(id);

        const data = await FillDepartmentFormRequest(id);

        if (data?.offeredSubjects) {
          setSubjects(data.offeredSubjects);
        }
      } else {
        setObjectID(0);
        dispatch(ResetDepartmentFormValue());
        setSubjects([]);
      }
    };

    loadData();
  }, [location.search, dispatch]);

  /* ================= INPUT HANDLER ================= */
  const handleChange = (name, value) => {
    dispatch(OnChangeDepartmentInput({ Name: name, Value: value }));
  };

  /* ================= SUBJECT HANDLERS ================= */
  const addSubject = () => {
    if (IsEmpty(newSubject)) {
      ErrorToast("Subject name required");
      return;
    }

    if (subjects.some(s => s.name.toLowerCase() === newSubject.toLowerCase())) {
      ErrorToast("Subject already exists");
      return;
    }

    setSubjects([...subjects, { name: newSubject.trim(), isActive: true }]);
    setNewSubject("");
  };

  const toggleSubject = (index) => {
    const updated = [...subjects];
    updated[index].isActive = !updated[index].isActive;
    setSubjects(updated);
  };

  const removeSubject = async (index) => {
    const confirm = await Swal.fire({
      title: "Remove Subject?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Remove",
    });

    if (!confirm.isConfirmed) return;

    setSubjects(subjects.filter((_, i) => i !== index));
  };

  /* ================= SAVE ================= */
  const SaveChange = async () => {
    const { program, departmentName, departmentCode } = FormValue;

    if (IsEmpty(program)) {
      ErrorToast("Program is required");
      return;
    }

    if (IsEmpty(departmentName)) {
      ErrorToast("Department name is required");
      return;
    }

    if (IsEmpty(departmentCode)) {
      ErrorToast("Department code is required");
      return;
    }

    if (ObjectID) {
      const confirm = await Swal.fire({
        title: "Confirm Update",
        text: "Are you sure you want to update this department?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Update",
      });

      if (!confirm.isConfirmed) return;
    }

    setLoading(true);

    const payload = {
      program,
      departmentName,
      departmentCode: departmentCode.toUpperCase(),
      offeredSubjects: subjects,
    };

    const success = await CreateDepartmentRequest(payload, ObjectID);

    setLoading(false);

    if (success) {
      SuccessToast(ObjectID ? "Department Updated Successfully!" : "Department Created Successfully!");
      navigate("/department-list");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container-fluid">
      <div className="card shadow-sm">
        <div className="card-body">

          <h5 className="fw-bold">
            {ObjectID ? "Update Department" : "Create Department"}
          </h5>
          <hr />

          {/* PROGRAM */}
          <div className="mb-3 col-4">
            <label className="form-label fw-bold">Program</label>
            <select
              className="form-select form-select-sm"
              value={FormValue.program || ""}
              onChange={(e) => handleChange("program", e.target.value)}
            >
              <option value="">Select Program</option>
              {PROGRAMS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* DEPARTMENT NAME */}
          <div className="mb-3 col-4">
            <label className="form-label fw-bold">Department Name</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={FormValue.departmentName || ""}
              onChange={(e) => handleChange("departmentName", e.target.value)}
            />
          </div>

          {/* DEPARTMENT CODE */}
          <div className="mb-3 col-4">
            <label className="form-label fw-bold">Department Code</label>
            <input
              type="text"
              className="form-control form-control-sm text-uppercase"
              value={FormValue.departmentCode || ""}
              onChange={(e) => handleChange("departmentCode", e.target.value)}
            />
          </div>

          {/* SUBJECT MANAGEMENT */}
          <div className="mt-4">
            <h6 className="fw-bold">Offered Subjects</h6>

            <div className="d-flex gap-2 mb-3 col-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Enter subject name"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
              <button className="btn btn-sm btn-primary" onClick={addSubject}>
                Add
              </button>
            </div>

            {subjects.map((s, i) => (
              <div key={i} className="d-flex justify-content-between border rounded p-2 mb-2 col-6">
                <span className={s.isActive ? "" : "text-muted text-decoration-line-through"}>
                  {s.name}
                </span>

                <div className="d-flex gap-2">
                  <button
                    className={`btn btn-sm ${s.isActive ? "btn-warning" : "btn-success"}`}
                    onClick={() => toggleSubject(i)}
                  >
                    {s.isActive ? "Deactivate" : "Activate"}
                  </button>

                  <button className="btn btn-sm btn-danger" onClick={() => removeSubject(i)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* SAVE */}
          <button
            onClick={SaveChange}
            className="btn btn-sm btn-success mt-4"
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
