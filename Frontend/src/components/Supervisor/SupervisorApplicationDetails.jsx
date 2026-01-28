import React from "react";
import { BaseURL } from "../../helper/config";


const SupervisorApplicationDetails = ({ app, onClose }) => {
  if (!app) return null;

  return (
    <div className="modal show d-block bg-dark bg-opacity-50">
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">

          {/* ================= HEADER ================= */}
          <div className="modal-header">
            <h5 className="modal-title">
              Application Details – {app.applicantName}
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          {/* ================= BODY ================= */}
          <div className="modal-body">

            {/* ================= PROGRAM ================= */}
            <h6 className="fw-bold">Program Information</h6>
            <p><b>Program:</b> {app.program}</p>
            <p><b>Department:</b> {app.department?.name}</p>
            <p><b>Supervisor:</b> {app.supervisor?.name}</p>
            <p><b>Academic Year:</b> {app.academicYear}</p>

            <hr />

            {/* ================= PERSONAL ================= */}
            <h6 className="fw-bold">Personal Information</h6>
            <p><b>Name:</b> {app.applicantName}</p>
            <p><b>Email:</b> {app.email}</p>
            <p><b>Mobile:</b> {app.mobile}</p>
            <p><b>Father:</b> {app.fatherName || "—"}</p>
            <p><b>Mother:</b> {app.motherName || "—"}</p>
            <p>
              <b>Date of Birth:</b>{" "}
              {app.dateOfBirth ? app.dateOfBirth.slice(0, 10) : "—"}
            </p>

            <hr />

            {/* ================= ADDRESS ================= */}
            <h6 className="fw-bold">Address</h6>
            <p>
              <b>Present:</b>{" "}
              {app.presentAddress?.village}, {app.presentAddress?.postOffice}-{app.presentAddress?.postalCode}, {app.presentAddress?.subDistrict}, {app.presentAddress?.district}
            </p>
            <p>
              <b>Permanent:</b>{" "}
              {app.presentAddress?.village}, {app.presentAddress?.postOffice}-{app.presentAddress?.postalCode}, {app.presentAddress?.subDistrict}, {app.presentAddress?.district}
            </p>

            <hr />

            {/* ================= ACADEMIC ================= */}
            <h6 className="fw-bold">Academic Records</h6>
            {(app.academicRecords || []).length === 0 ? (
              <p className="text-muted">No academic records</p>
            ) : (
              <ul>
                {(app.academicRecords || []).map((r, i) => (
                  <li key={i}>
                    <b>{r.examLevel}</b> – {r.institution} – CGPA{" "}
                    {r.cgpa}/{r.cgpaScale}
                    {r.isFinal === false && " (Appeared)"}
                  </li>
                ))}
              </ul>
            )}

            {/* ================= COURSE GPA ================= */}
            {(app.appliedSubjectCourses || []).length > 0 && (
              <>
                <hr />
                <h6 className="fw-bold">Course-wise GPA</h6>

                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Code</th>
                      <th>Title</th>
                      <th>Credit</th>
                      <th>GP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(app.appliedSubjectCourses || []).map((c, i) => (
                      <tr key={i}>
                        <td>{c.courseCode}</td>
                        <td>{c.courseTitle}</td>
                        <td>{c.creditHour}</td>
                        <td>{c.gradePoint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p>
                  <b>Calculated CGPA:</b>{" "}
                  {app.calculatedCGPA ?? "N/A"}
                </p>
              </>
            )}

            <hr />

            {/* ================= SERVICE ================= */}
            {app.isInService && (
              <>
                <h6 className="fw-bold">Service Information</h6>
                <p><b>Position:</b> {app.serviceInfo?.position}</p>
                <p><b>Employer:</b> {app.serviceInfo?.employer}</p>
                <p><b>Service Length:</b> {app.serviceInfo?.lengthOfService}</p>
                <hr />
              </>
            )}

            {/* ================= PUBLICATIONS ================= */}
            {(app.publications || []).length > 0 && (
              <>
                <h6 className="fw-bold">Publications</h6>
                <ul>
                  {(app.publications || []).map((p, i) => (
                    <li key={i}>
                      <a href={p} target="_blank" rel="noreferrer">
                        {p}
                      </a>
                    </li>
                  ))}
                </ul>
                <hr />
              </>
            )}

            {/* ================= DOCUMENTS ================= */}
            {/* ================= DOCUMENTS ================= */}
<h6 className="fw-bold">Uploaded Documents</h6>
{(app.documents || []).length === 0 ? (
  <p className="text-muted">No documents uploaded</p>
) : (
  <ul>
    {(app.documents || []).map((d, i) => (
      <li key={i}>
        <a
          href={`${BaseURL.replace("/api/v1", "")}${d.fileUrl}`}
          target="_blank"
          rel="noreferrer"
        >
          {d.title}
        </a>{" "}
        ({d.fileType}, {d.fileSizeKB} KB)
      </li>
    ))}
  </ul>
)}


            <hr />

            {/* ================= PAYMENT ================= */}
            <h6 className="fw-bold">Payment Information</h6>
            <p>
              <b>Transaction ID:</b> {app.payment?.transactionId}
              <br />
              <b>Amount:</b> ৳{app.payment?.amount}
              <br />
              <b>Status:</b> SUCCESS
            </p>

          </div>

          {/* ================= FOOTER ================= */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SupervisorApplicationDetails;
