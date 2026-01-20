import { useEffect } from "react";
import { calculateCGPA } from "../../helper/calculateCGPA";
import {
  GetDepartmentLastSemesterCoursesRequest
} from "../../APIRequest/AdmissionAPIRequest";

const AcademicInfoForm = ({ formData, setFormData }) => {
  const {
    program,
    department,
    academicRecords = [],
    isPSTUStudent,
    pstuLastSemesterCourses = [],
    pstuBScInfo = {}
  } = formData;

  /* =================================================
     UPSERT ACADEMIC RECORD
  ================================================= */
  const upsertRecord = (payload) => {
    const filtered = academicRecords.filter(
      r => r.examLevel !== payload.examLevel
    );

    setFormData(prev => ({
      ...prev,
      academicRecords: [...filtered, payload]
    }));
  };

  /* =================================================
     LOAD PSTU COURSES (MS / MBA ONLY)
  ================================================= */
  useEffect(() => {
    if (
      program !== "PhD" &&
      isPSTUStudent &&
      department
    ) {
      (async () => {
        const courses =
          await GetDepartmentLastSemesterCoursesRequest(department);

        setFormData(prev => ({
          ...prev,
          pstuLastSemesterCourses: courses.map(c => ({
            ...c,
            gradePoint: ""
          }))
        }));
      })();
    }
  }, [isPSTUStudent, department, program]);

  /* =================================================
     AUTO CGPA FROM COURSES (PSTU)
  ================================================= */
  useEffect(() => {
    if (
      program !== "PhD" &&
      isPSTUStudent &&
      pstuLastSemesterCourses.length
    ) {
      const cgpa = calculateCGPA(pstuLastSemesterCourses);

      if (cgpa !== null) {
        upsertRecord({
          examLevel: "BSc",
          institution:
            academicRecords.find(r => r.examLevel === "BSc")
              ?.institution || "",
          passingYear:
            academicRecords.find(r => r.examLevel === "BSc")
              ?.passingYear || "",
          cgpa,
          cgpaScale: 4,
          isFinal: true
        });
      }
    }
  }, [pstuLastSemesterCourses]);

  /* =================================================
     RENDER ACADEMIC BLOCK
  ================================================= */
  const renderAcademicBlock = (level, scale) => {
    const existing =
      academicRecords.find(r => r.examLevel === level) || {};

    return (
      <div className="border p-3 mb-3">
        <h6>{level} Information</h6>

        <input
          className="form-control mb-2"
          placeholder="Institute Name"
          value={existing.institution || ""}
          onChange={e =>
            upsertRecord({
              ...existing,
              examLevel: level,
              institution: e.target.value,
              cgpaScale: scale,
              isFinal: true
            })
          }
          required
        />

        <input
          className="form-control mb-2"
          placeholder="Passing Year"
          value={existing.passingYear || ""}
          onChange={e =>
            upsertRecord({
              ...existing,
              examLevel: level,
              passingYear: e.target.value,
              cgpaScale: scale,
              isFinal: true
            })
          }
          required
        />

        <input
  className="form-control"
  type="number"
  step="0.01"
  placeholder={`CGPA (out of ${scale})`}
  value={existing.cgpa ?? ""}
  onChange={e =>
    upsertRecord({
      ...existing,
      examLevel: level,
      cgpa: e.target.value === "" ? "" : Number(e.target.value),
      cgpaScale: scale,
      isFinal: true
    })
  }
  required
  // disabled={
  //   level === "BSc" &&
  //   isPSTUStudent &&
  //   program !== "PhD"
  // }
/>

      </div>
    );
  };

  return (
    <div className="card p-3 mt-3">
      <h5>Academic Information</h5>

      {/* PROGRAM BASED ACADEMIC INFO */}

/* SSC & HSC are always required */
{renderAcademicBlock("SSC", 5)}
{renderAcademicBlock("HSC", 5)}

{/* BSc / BBA is ALWAYS required */}
{program === "BBA"
  ? renderAcademicBlock("BBA", 4)
  : renderAcademicBlock("BSc", 4)}

/* PhD: Master depends on Bachelor */
{program === "PhD" && (
  program === "BBA"
    ? renderAcademicBlock("MBA", 4)
    : renderAcademicBlock("MS", 4)
)}


      {/* PSTU CHECK */}
      {program !== "PhD" && (
        <div className="form-check mt-2">
          <input
            type="checkbox"
            className="form-check-input"
            checked={isPSTUStudent}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                isPSTUStudent: e.target.checked,
                pstuLastSemesterCourses: [],
                pstuBScInfo: {}
              }))
            }
          />
          <label className="form-check-label">
            BSc / BBA completed from PSTU
          </label>
        </div>
      )}

      {/* PSTU EXTRA INFO */}
      {program !== "PhD" && isPSTUStudent && (
        <div className="border p-3 mt-3">
          <h6>PSTU BSc / BBA Information</h6>

          <input
            className="form-control mb-2"
            placeholder="Registration Number"
            value={pstuBScInfo.registrationNo || ""}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                pstuBScInfo: {
                  ...prev.pstuBScInfo,
                  registrationNo: e.target.value
                }
              }))
            }
            required
          />

          <input
            className="form-control"
            placeholder="Session (e.g. 2020–21)"
            value={pstuBScInfo.session || ""}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                pstuBScInfo: {
                  ...prev.pstuBScInfo,
                  session: e.target.value
                }
              }))
            }
            required
          />
        </div>
      )}

      {/* PSTU LAST SEMESTER COURSES */}
      {program !== "PhD" &&
        isPSTUStudent &&
        pstuLastSemesterCourses.map((c, i) => (
          <div key={i} className="border p-2 mt-2">
            <strong>
              {c.courseCode} – {c.courseTitle}
            </strong>
            <p>Credit Hour: {c.creditHour}</p>

            <input
              type="number"
              step="0.01"
              min="0"
              max="4"
              className="form-control"
              placeholder="Grade Point (0.00 – 4.00)"
              onChange={e => {
                const updated = [...pstuLastSemesterCourses];
                updated[i] = {
                  ...c,
                  gradePoint: Number(e.target.value)
                };
                setFormData(prev => ({
                  ...prev,
                  pstuLastSemesterCourses: updated
                }));
              }}
              required
            />
          </div>
        ))}
    </div>
  );
};

export default AcademicInfoForm;
