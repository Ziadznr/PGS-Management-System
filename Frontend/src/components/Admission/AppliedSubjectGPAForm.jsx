import { useEffect, useMemo } from "react";

const MIN_CGPA = 2.75;

// ✔ Department code (A–Z) + exactly 3 digits
const COURSE_CODE_REGEX = /^[A-Z]+[0-9]{3}$/;

const AppliedSubjectGPAForm = ({ formData, setFormData }) => {
  const {
    program,
    appliedSubjectCourses = [],
    calculatedCGPA
  } = formData;

  // Only applicable programs
  if (!["MS", "MBA", "LLM"].includes(program)) return null;

  /* =================================================
     AUTO CALCULATE CGPA
  ================================================= */
  const computedCGPA = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;

    appliedSubjectCourses.forEach(c => {
      const credit = parseFloat(c.creditHour);
      const grade = parseFloat(c.gradePoint);

      if (
        credit > 0 &&
        !isNaN(grade) &&
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
     SYNC CGPA & ELIGIBILITY
  ================================================= */
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      calculatedCGPA: computedCGPA,
      isEligibleByCGPA:
        computedCGPA === null ? true : computedCGPA >= MIN_CGPA
    }));
  }, [computedCGPA, setFormData]);

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
          creditHour: "",
          gradePoint: ""
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
      // ✔ Uppercase + remove invalid chars
      value = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
    }

    updated[index] = { ...updated[index], [field]: value };

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

      {appliedSubjectCourses.map((course, index) => {
        const isValid =
          course.courseCode === "" ||
          COURSE_CODE_REGEX.test(course.courseCode);

        return (
          <div
            key={course.id || index}
            className="row g-2 mb-2 align-items-end"
          >
            {/* COURSE CODE */}
            <div className="col-md-4">
              <input
                className={`form-control ${
                  !isValid ? "is-invalid" : ""
                }`}
                placeholder="Course Code (e.g. CSE101)"
                value={course.courseCode}
                onChange={e =>
                  updateCourse(index, "courseCode", e.target.value)
                }
                required
              />
              {!isValid && (
                <div className="invalid-feedback">
                  Must be uppercase department code + 3 digits (e.g. CSE101)
                </div>
              )}
            </div>

            {/* CREDIT HOUR */}
            <div className="col-md-3">
              <input
                type="number"
                step="0.5"
                min="0"
                className="form-control"
                placeholder="Credit Hour"
                value={course.creditHour}
                onChange={e =>
                  updateCourse(index, "creditHour", e.target.value)
                }
                required
              />
            </div>

            {/* GRADE POINT */}
            <div className="col-md-3">
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

            {/* REMOVE */}
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

      {/* ================= RESULT ================= */}
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
