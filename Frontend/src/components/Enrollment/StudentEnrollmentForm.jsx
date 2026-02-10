import React, { useEffect, useState } from "react";
import {
  EnrollmentDetailsRequest,
  CreateOrUpdateEnrollmentRequest
} from "../../APIRequest/EnrollmentAPIRequest";
import {
  ErrorToast,
  SuccessToast,
  IsEmpty,
  IsMobile
} from "../../helper/FormHelper";
import { getTempEnrollment } from "../../helper/SessionHelper";

const StudentEnrollmentForm = () => {

  /* ================= READ-ONLY DATA ================= */
  const [application, setApplication] = useState(null);

  /* ================= EDITABLE FIELDS ================= */
  const [religion, setReligion] = useState("");
  const [pstuRegistrationNo, setPstuRegistrationNo] = useState("");
  const [fatherMobile, setFatherMobile] = useState("");
  const [motherMobile, setMotherMobile] = useState("");

  const [localGuardian, setLocalGuardian] = useState({
    name: "",
    address: "",
    mobile: ""
  });

  const [loading, setLoading] = useState(false);

  /* ================= LOAD EXISTING ENROLLMENT ================= */

useEffect(() => {
  let intervalId;

  const loadEnrollment = async () => {
    const temp = getTempEnrollment();

    // ⏳ wait until temp session exists
    if (!temp?.loginId) {
      return;
    }

    const data = await EnrollmentDetailsRequest();
    if (!data) return;

    setApplication(data);

    setReligion(data.religion || "");
    setPstuRegistrationNo(data.pstuRegistrationNo || "");
    setFatherMobile(data.fatherMobile || "");
    setMotherMobile(data.motherMobile || "");
    setLocalGuardian(
      data.localGuardian || { name: "", address: "", mobile: "" }
    );

    clearInterval(intervalId); // ✅ stop polling
  };

  loadEnrollment(); // try immediately
  intervalId = setInterval(loadEnrollment, 300); // retry

  return () => clearInterval(intervalId);
}, []);



  /* ================= AGE CALC ================= */
  const getAge = dob => {
    if (!dob) return "";
    const d = new Date(dob);
    const t = new Date();
    let age = t.getFullYear() - d.getFullYear();
    if (
      t.getMonth() < d.getMonth() ||
      (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())
    ) age--;
    return age;
  };

  /* ================= SAVE DRAFT ================= */
  const handleSave = async () => {
    if (IsEmpty(religion)) return ErrorToast("Religion required");

    if (IsEmpty(localGuardian.name)) {
      return ErrorToast("Local guardian name required");
    }

    if (IsEmpty(localGuardian.address)) {
      return ErrorToast("Local guardian address required");
    }

    if (!IsMobile(localGuardian.mobile)) {
      return ErrorToast("Valid local guardian mobile required");
    }

    setLoading(true);

    const success = await CreateOrUpdateEnrollmentRequest({
      religion,
      pstuRegistrationNo,
      fatherMobile,
      motherMobile,
      localGuardian
    });

    setLoading(false);

    if (success) {
      SuccessToast("Enrollment draft saved");
    }
  };

 if (!application) {
  return (
    <div className="text-center mt-5">
      <h5>⏳ Loading enrollment form...</h5>
      <small className="text-muted">
        If this takes too long, please re-login.
      </small>
    </div>
  );
}

  /* ================= UI ================= */
  return (
    <div className="container mt-4">
      <h4 className="mb-3">🎓 Student Enrollment Form</h4>

      {/* ================= BASIC INFO ================= */}
      <div className="card mb-3">
        <div className="card-body">
          <h6 className="mb-2">Application Information</h6>

          <p><strong>Application No:</strong> {application.applicationNo}</p>
          <p><strong>Program:</strong> {application.program}</p>
          <p><strong>Academic Year:</strong> {application.academicYear}</p>
          <p><strong>Department:</strong> {application.department?.name}</p>
          <p><strong>Supervisor:</strong> {application.supervisorNameSnapshot}</p>
        </div>
      </div>

      {/* ================= PERSONAL INFO ================= */}
      <div className="card mb-3">
        <div className="card-body">
          <h6>Applicant Information</h6>

          <p><strong>Name:</strong> {application.applicantName}</p>
          <p><strong>Father:</strong> {application.fatherName}</p>
          <p><strong>Mother:</strong> {application.motherName}</p>
          <p><strong>Date of Birth:</strong> {new Date(application.dateOfBirth).toDateString()}</p>
          <p><strong>Age:</strong> {getAge(application.dateOfBirth)}</p>
          <p><strong>Sex:</strong> {application.sex}</p>
          <p><strong>Marital Status:</strong> {application.maritalStatus}</p>
          <p><strong>Nationality:</strong> {application.nationality}</p>
        </div>
      </div>
{/* ================= ADDRESS INFO ================= */}
{/* ================= ADDRESS INFORMATION ================= */}
<div className="card mb-3">
  <div className="card-body">
    <h6 className="mb-3">Address Information</h6>

    <div className="row">
      {/* PRESENT ADDRESS */}
      <div className="col-md-6 mb-3">
        <div className="border rounded p-3 h-100 bg-light">
          <h6 className="text-primary mb-2">📍 Present Address</h6>

          <p className="mb-1">
            <strong>Village:</strong> {application.presentAddress?.village}
          </p>
          <p className="mb-1">
            <strong>Post Office:</strong> {application.presentAddress?.postOffice}
          </p>
          <p className="mb-1">
            <strong>Postal Code:</strong> {application.presentAddress?.postalCode}
          </p>
          <p className="mb-1">
            <strong>Sub-district:</strong> {application.presentAddress?.subDistrict}
          </p>
          <p className="mb-0">
            <strong>District:</strong> {application.presentAddress?.district}
          </p>
        </div>
      </div>

      {/* PERMANENT ADDRESS */}
      <div className="col-md-6">
        <div className="border rounded p-3 h-100 bg-light">
          <h6 className="text-success mb-2">🏠 Permanent Address</h6>

          <p className="mb-1">
            <strong>Village:</strong> {application.permanentAddress?.village}
          </p>
          <p className="mb-1">
            <strong>Post Office:</strong> {application.permanentAddress?.postOffice}
          </p>
          <p className="mb-1">
            <strong>Postal Code:</strong> {application.permanentAddress?.postalCode}
          </p>
          <p className="mb-1">
            <strong>Sub-district:</strong> {application.permanentAddress?.subDistrict}
          </p>
          <p className="mb-0">
            <strong>District:</strong> {application.permanentAddress?.district}
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

{/* ================= CONTACT INFO ================= */}
<div className="card mb-3">
  <div className="card-body">
    <h6>Contact Information</h6>

    <p><strong>Email:</strong> {application.email}</p>
    <p><strong>Mobile:</strong> {application.mobile}</p>
  </div>
</div>
{/* ================= ACADEMIC INFO ================= */}
<div className="card mb-3">
  <div className="card-body">
    <h6>Academic Information</h6>

    <p><strong>Calculated CGPA:</strong> {application.calculatedCGPA}</p>
    <p><strong>Total Credit Hours (Bachelor):</strong> {application.totalCreditHourBachelor}</p>

    <hr />

    {/* ================= ACADEMIC RECORDS ================= */}
<div className="card mb-3">
  <div className="card-body">
    <h6 className="mb-3">Academic Records</h6>

    {application.academicRecords?.length === 0 ? (
      <p className="text-muted">No academic records found</p>
    ) : (
      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Exam Level</th>
              <th>Institution</th>
              <th>Passing Year</th>
              <th>CGPA</th>
              <th>Scale</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {application.academicRecords.map((record, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{record.examLevel}</td>
                <td>{record.institution}</td>
                <td>{record.passingYear}</td>
                <td>{record.cgpa}</td>
                <td>{record.cgpaScale}</td>
                <td>
                  {record.isFinal ? (
                    <span className="badge bg-success">
                      Final
                    </span>
                  ) : (
                    <span className="badge bg-warning text-dark">
                      Appeared
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</div>

  </div>
</div>

      {/* ================= EDITABLE SECTION ================= */}
      <div className="card mb-3">
        <div className="card-body">
          <h6>Required Information</h6>

          <input
            className="form-control mb-2"
            placeholder="Religion *"
            value={religion}
            onChange={e => setReligion(e.target.value)}
          />

          <input
            className="form-control mb-2"
            placeholder="PSTU Registration No (if any)"
            value={pstuRegistrationNo}
            onChange={e => setPstuRegistrationNo(e.target.value)}
          />

          <input
            className="form-control mb-2"
            placeholder="Father Mobile (optional)"
            value={fatherMobile}
            onChange={e => setFatherMobile(e.target.value)}
          />

          <input
            className="form-control mb-2"
            placeholder="Mother Mobile (optional)"
            value={motherMobile}
            onChange={e => setMotherMobile(e.target.value)}
          />
        </div>
      </div>

      {/* ================= LOCAL GUARDIAN ================= */}
      <div className="card mb-3">
        <div className="card-body">
          <h6>Local Guardian (Required)</h6>

          <input
            className="form-control mb-2"
            placeholder="Guardian Name"
            value={localGuardian.name}
            onChange={e =>
              setLocalGuardian({ ...localGuardian, name: e.target.value })
            }
          />

          <textarea
            className="form-control mb-2"
            placeholder="Guardian Address"
            value={localGuardian.address}
            onChange={e =>
              setLocalGuardian({ ...localGuardian, address: e.target.value })
            }
          />

          <input
            className="form-control mb-2"
            placeholder="Guardian Mobile"
            value={localGuardian.mobile}
            onChange={e =>
              setLocalGuardian({ ...localGuardian, mobile: e.target.value })
            }
          />
        </div>
      </div>

      {/* ================= SAVE ================= */}
      <button
        className="btn btn-success w-100"
        disabled={loading}
        onClick={handleSave}
      >
        {loading ? "Saving..." : "Save Enrollment Draft"}
      </button>

    </div>
  );
};

export default StudentEnrollmentForm;
