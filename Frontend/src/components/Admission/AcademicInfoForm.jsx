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
  const renderAcademicBlock = (level, scale) => {
    const existing =
      academicRecords.find(r => r.examLevel === level) || {};

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

            // allow empty while typing
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

            // block invalid CGPA
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

        <small className="text-muted">
          Maximum allowed CGPA: {scale.toFixed(2)}
        </small>
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

      {/* Bachelor Degree (Always Required) */}
      {program === "LLM"
        ? renderAcademicBlock("LLB", 4)
        : program === "MBA"
        ? renderAcademicBlock("BBA", 4)
        : renderAcademicBlock("BSc", 4)}

      {/* Master Degree (ONLY for PhD Applicants) */}
      {program === "PhD" && (
        <>
          {program === "LLM"
            ? renderAcademicBlock("LLM", 4)
            : renderAcademicBlock("MS", 4)}
        </>
      )}
    </div>
  );
};

export default AcademicInfoForm;
