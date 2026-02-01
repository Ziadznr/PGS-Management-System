const AcademicInfoForm = ({ formData, setFormData }) => {
  const { program, academicRecords = [] } = formData;

  /* =================================================
     UPSERT ACADEMIC RECORD (SAFE)
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
     RENDER ACADEMIC BLOCK (WITH CGPA VALIDATION)
  ================================================= */
  const renderAcademicBlock = (level, scale, minCGPA = null) => {
    const existing =
      academicRecords.find(r => r.examLevel === level) || {};

    const cgpaNum = Number(existing.cgpa);
    const showMinWarning =
      minCGPA !== null &&
      !isNaN(cgpaNum) &&
      cgpaNum < minCGPA;

    return (
      <div className="border rounded p-3 mb-3">
        <h6 className="fw-semibold mb-3">{level} Information</h6>

        {/* Institution */}
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

        {/* Passing Year */}
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

        {/* CGPA */}
        <input
          className="form-control"
          type="number"
          step="0.01"
          min="0"
          max={scale}
          placeholder={`CGPA (out of ${scale})`}
          value={existing.cgpa ?? ""}
          onChange={e => {
            const value = e.target.value;

            if (value === "") {
              upsertRecord({
                ...existing,
                examLevel: level,
                cgpa: "",
                cgpaScale: scale,
                isFinal: true
              });
              return;
            }

            const num = Number(value);
            if (isNaN(num) || num < 0 || num > scale) return;

            upsertRecord({
              ...existing,
              examLevel: level,
              cgpa: num,
              cgpaScale: scale,
              isFinal: true
            });
          }}
          required
        />

        <small className="text-muted d-block">
          Maximum allowed CGPA: {scale.toFixed(2)}
        </small>

        {/* ✅ MIN CGPA WARNING */}
        {showMinWarning && (
          <small className="text-danger">
            Minimum required CGPA for {program} is {minCGPA}
          </small>
        )}
      </div>
    );
  };

  /* =================================================
     UI
  ================================================= */
  return (
    <div className="card p-3 mt-3">
      <h5 className="mb-3">9. Academic Information</h5>

      {/* SSC & HSC (Always Required) */}
      {renderAcademicBlock("SSC", 5)}
      {renderAcademicBlock("HSC", 5)}

      {/* Bachelor Degree (MIN CGPA = 2.25 for MS/MBA/LLM) */}
      {program === "LLM"
        ? renderAcademicBlock("LLB", 4, ["MS", "MBA", "LLM"].includes(program) ? 2.25 : null)
        : program === "MBA"
        ? renderAcademicBlock("BBA", 4, ["MS", "MBA", "LLM"].includes(program) ? 2.25 : null)
        : renderAcademicBlock("BSc", 4, ["MS", "MBA", "LLM"].includes(program) ? 2.25 : null)}

      {/* Master Degree (ONLY for PhD Applicants) */}
      {program === "PhD" && (
        <>
          {renderAcademicBlock("MS", 4)}
        </>
      )}
    </div>
  );
};

export default AcademicInfoForm;
