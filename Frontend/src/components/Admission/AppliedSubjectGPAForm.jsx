import { useEffect, useMemo } from "react";

const MIN_CGPA = 2.50;

// ✔ Department code (A–Z) + exactly 3 digits
const COURSE_CODE_REGEX = /^[A-Z]+[0-9]{3}$/;

const AppliedSubjectGPAForm = ({ formData, setFormData }) => {
  const { program, appliedSubjectCourses = [] } = formData;

  // Only applicable programs
  if (!["MS", "MBA", "LLM"].includes(program)) return null;

  /* =================================================
     AUTO CALCULATE CGPA
  ================================================= */
  const computedCGPA = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;

    appliedSubjectCourses.forEach(c => {
      const credit = Number(c.creditHour);
      const grade = Number(c.gradePoint);

      if (
        credit > 0 &&
        !Number.isNaN(grade) &&
        grade >= 0 &&
        grade <= 4
      ) {
        totalCredits += credit;
        totalPoints += credit * grade;
      }
    });

    return totalCredits > 0
      ? Number((totalPoints / totalCredits).toFixed(2))
      : null;
  }, [appliedSubjectCourses]);

  /* =================================================
     TOTAL APPLIED SUBJECT CREDIT HOUR
  ================================================= */
  const totalAppliedCreditHour = useMemo(() => {
    return appliedSubjectCourses.reduce((sum, c) => {
      const credit = Number(c.creditHour);
      return !Number.isNaN(credit) && credit > 0
        ? sum + credit
        : sum;
    }, 0);
  }, [appliedSubjectCourses]);

  /* =================================================
     SYNC CGPA & CREDIT TOTALS
  ================================================= */
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      calculatedCGPA: computedCGPA,
      totalCreditHourAppliedSubject:
        totalAppliedCreditHour > 0
          ? Number(totalAppliedCreditHour.toFixed(2))
          : null,
      isEligibleByCGPA:
        computedCGPA === null ? true : computedCGPA >= MIN_CGPA
    }));
  }, [computedCGPA, totalAppliedCreditHour, setFormData]);

  
  /* =================================================
     HANDLERS
  ================================================= */
  const addCourse = () => {
    setFormData(prev => ({
      ...prev,
      appliedSubjectCourses: [
        ...(prev.appliedSubjectCourses || []),
        {
          id: Date.now(),
          courseCode: "",
          courseTitle: "",
          creditHour: "",
          gradePoint: "",
          gpXch: 0
        }
      ]
    }));
  };

  const removeCourse = (index) => {
    setFormData(prev => ({
      ...prev,
      appliedSubjectCourses: prev.appliedSubjectCourses.filter(
        (_, i) => i !== index
      )
    }));
  };

  const updateCourse = (index, field, value) => {
    const updated = [...appliedSubjectCourses];

    if (field === "courseCode") {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    const updatedCourse = {
      ...updated[index],
      [field]: value
    };

    const credit = Number(updatedCourse.creditHour);
    const grade = Number(updatedCourse.gradePoint);

    if (!Number.isNaN(credit) && !Number.isNaN(grade)) {
      updatedCourse.gpXch = Number((credit * grade).toFixed(2));
    }

    updated[index] = updatedCourse;

    setFormData(prev => ({
      ...prev,
      appliedSubjectCourses: updated
    }));
  };

  const isEligible =
    computedCGPA === null ? true : computedCGPA >= MIN_CGPA;

  /* =================================================
     UI
  ================================================= */
  return (
    <div className="card p-3 mt-3">
      <h5 className="mb-2">Course-wise GPA Calculation</h5>

      <p className="text-muted">
        Course code format: <strong>CSE101</strong>, <strong>EEE205</strong>
        <br />
        <strong>Minimum required CGPA: {MIN_CGPA}</strong>
      </p>

      {/* ================= CREDIT INPUTS ================= */}
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label fw-bold">
            Bachelor (BSc/BBA/LLB) Total Credit Hour
          </label>
          <input
            type="number"
            min="0"
            step="1"
            className="form-control"
            placeholder="e.g. 140"
            value={formData.totalCreditHourBachelor || ""}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                totalCreditHourBachelor: e.target.value
                  ? Number(e.target.value)
                  : null
              }))
            }
            required
          />
        </div>

        <div className="col-md-4">
          <label className="form-label fw-bold">
            Applied Subject Total Credit Hour
          </label>
          <input
            type="number"
            className="form-control"
            value={totalAppliedCreditHour.toFixed(2)}
            disabled
          />
        </div>
      </div>

      {/* ================= COURSE LIST ================= */}
      {appliedSubjectCourses.map((course, index) => {
        const isCodeValid =
          course.courseCode === "" ||
          COURSE_CODE_REGEX.test(course.courseCode);

        return (
          <div key={course.id || index} className="row g-2 mb-2">
            <div className="col-md-3">
              <input
                className={`form-control ${
                  !isCodeValid ? "is-invalid" : ""
                }`}
                placeholder="Course Code (CSE101)"
                value={course.courseCode}
                onChange={e =>
                  updateCourse(index, "courseCode", e.target.value)
                }
                required
              />
              {!isCodeValid && (
                <div className="invalid-feedback">
                  Must be uppercase letters + 3 digits
                </div>
              )}
            </div>

            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Course Title"
                value={course.courseTitle}
                onChange={e =>
                  updateCourse(index, "courseTitle", e.target.value)
                }
                required
              />
            </div>

            <div className="col-md-2">
              <input
                type="number"
                step="0.5"
                min="0.5"
                className="form-control"
                placeholder="Credit"
                value={course.creditHour}
                onChange={e =>
                  updateCourse(index, "creditHour", e.target.value)
                }
                required
              />
            </div>

            <div className="col-md-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                className="form-control"
                placeholder="Grade Point"
                value={course.gradePoint}
                onChange={e =>
                  updateCourse(index, "gradePoint", e.target.value)
                }
                required
              />
            </div>

            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-danger w-100"
                onClick={() => removeCourse(index)}
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className="btn btn-outline-primary mt-2"
        onClick={addCourse}
      >
        + Add Course
      </button>

      {/* ================= CREDIT SUMMARY ================= */}
      <div className="alert alert-secondary mt-3">
        <strong>Credit Summary</strong>
        <ul className="mb-0">
          <li>
            Bachelor Credit Hour:{" "}
            <strong>{formData.totalCreditHourBachelor || "—"}</strong>
          </li>
          <li>
            Applied Subject Credit Hour:{" "}
            <strong>{totalAppliedCreditHour.toFixed(2)}</strong>
          </li>
        </ul>
      </div>

      {/* ================= CGPA RESULT ================= */}
      {computedCGPA !== null && (
        <div
          className={`alert mt-3 text-center ${
            isEligible ? "alert-success" : "alert-danger"
          }`}
        >
          <strong>Calculated CGPA:</strong> {computedCGPA}
          <br />
          {isEligible ? (
            <>✅ You meet the minimum CGPA requirement</>
          ) : (
            <>❌ Minimum CGPA required is {MIN_CGPA}. You are not eligible.</>
          )}
        </div>
      )}
    </div>
  );
};

export default AppliedSubjectGPAForm;
