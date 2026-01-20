import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  SetDepartmentLastSemesterCoursesRequest,
  GetChairmanDepartmentLastSemesterCoursesRequest
} from "../../APIRequest/AdmissionAPIRequest";

const DepartmentLastSemesterCourses = () => {

  const [courses, setCourses] = useState([
    { courseCode: "", courseTitle: "", creditHour: "" }
  ]);

  const [loading, setLoading] = useState(true);

  /* =================================================
     LOAD EXISTING COURSES (CHAIRMAN)
  ================================================= */
  useEffect(() => {
    (async () => {
      const data =
        await GetChairmanDepartmentLastSemesterCoursesRequest();

      if (data?.courses?.length) {
        setCourses(
          data.courses.map(c => ({
            courseCode: c.courseCode,
            courseTitle: c.courseTitle,
            creditHour: c.creditHour
          }))
        );
      }

      setLoading(false);
    })();
  }, []);

  /* =================================================
     HANDLERS
  ================================================= */
  const addCourse = () => {
    setCourses([
      ...courses,
      { courseCode: "", courseTitle: "", creditHour: "" }
    ]);
  };

  const updateCourse = (index, field, value) => {
    const updated = [...courses];
    updated[index][field] = value;
    setCourses(updated);
  };

  // 🔴 CONFIRM BEFORE DELETE
  const removeCourse = async (index) => {
    const confirm = await Swal.fire({
      title: "Delete Course?",
      text: "This course will be removed from the list",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33"
    });

    if (!confirm.isConfirmed) return;

    const updated = courses.filter((_, i) => i !== index);
    setCourses(
      updated.length
        ? updated
        : [{ courseCode: "", courseTitle: "", creditHour: "" }]
    );
  };

  /* =================================================
     SUBMIT
  ================================================= */
  const submit = async () => {
    const invalid = courses.some(
      c => !c.courseCode || !c.courseTitle || !c.creditHour
    );

    if (invalid) {
      Swal.fire("Validation Error", "All course fields are required", "error");
      return;
    }

    const clean = courses.map(c => ({
      courseCode: c.courseCode.trim().toUpperCase(),
      courseTitle: c.courseTitle.trim(),
      creditHour: Number(c.creditHour)
    }));

    await SetDepartmentLastSemesterCoursesRequest(clean);

    Swal.fire("Success", "Courses saved successfully", "success");
  };

  /* =================================================
     RENDER
  ================================================= */
  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <h5>Loading department courses...</h5>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-3">
        Department Last Semester Courses
      </h3>

      <p className="text-muted">
        These courses will be used to calculate CGPA
        for PSTU students during admission.
      </p>

      {courses.map((course, index) => (
        <div key={index} className="card p-3 mb-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Course Code (e.g. CIT 421)"
                value={course.courseCode}
                onChange={e =>
                  updateCourse(index, "courseCode", e.target.value)
                }
              />
            </div>

            <div className="col-md-5">
              <input
                className="form-control"
                placeholder="Course Title"
                value={course.courseTitle}
                onChange={e =>
                  updateCourse(index, "courseTitle", e.target.value)
                }
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
              />
            </div>

            <div className="col-md-1 text-end">
              {courses.length > 1 && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeCourse(index)}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="d-flex gap-2">
        <button
          className="btn btn-secondary"
          onClick={addCourse}
        >
          + Add Course
        </button>

        <button
          className="btn btn-success"
          onClick={submit}
        >
          Save / Update Courses
        </button>
      </div>
    </div>
  );
};

export default DepartmentLastSemesterCourses;
