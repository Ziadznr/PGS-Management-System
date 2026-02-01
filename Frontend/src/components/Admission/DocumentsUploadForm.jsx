import axios from "axios";
import { BaseURL } from "../../helper/config";
import { ErrorToast, SuccessToast } from "../../helper/FormHelper";
import {
  getRequiredDocuments
} from "../../helper/documentRules";

const DocumentsUploadForm = ({ formData, setFormData }) => {

  const { optionalGroups, required } = getRequiredDocuments({
    program: formData.program,
    isInService: formData.isInService
  });

  /* ================= SINGLE FILE UPLOAD ================= */
  const uploadSingleDocument = async (docTitle, file) => {
    if (!file) return;

    const data = new FormData();
    data.append("documents", file);
    data.append("title", docTitle);

    if (formData.tempId) {
      data.append("tempId", formData.tempId);
    }

    try {
      const res = await axios.post(
        `${BaseURL}/admission/upload-temp-documents`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data?.status === "success") {
        setFormData(prev => ({
          ...prev,
          tempId: res.data.data.tempId,
          documents: res.data.data.documents,
          totalDocumentSizeKB: res.data.data.totalSizeKB
        }));

        SuccessToast(`${docTitle} uploaded`);
      } else {
        ErrorToast(res.data?.data || "Upload failed");
      }
    } catch {
      ErrorToast("Document upload failed");
    }
  };

  /* ================= HELPERS ================= */
  const getUploadedDoc = title =>
    formData.documents?.find(d => d.title === title);

  const isAnyUploaded = group =>
    group.some(title =>
      formData.documents?.some(d => d.title === title)
    );

  /* ================= UI ================= */
  return (
    <div className="card p-3 mt-3">
      <h6 className="fw-bold mb-2">📄 Required Documents</h6>

      <div className="alert alert-info">
        ℹ️ Upload each required document in its respective field.
        <br />
        <strong>Note:</strong> For SSC & HSC, upload <em>either </em>
         certificate <em>or</em> mark sheet.
      </div>

      {/* ================= SSC / HSC OPTIONAL GROUPS ================= */}
      {optionalGroups.map((group, i) => (
        <div key={i} className="border rounded p-3 mb-3">
          <h6 className="fw-semibold mb-2">
            {group[0].includes("SSC") ? "SSC Level" : "HSC Level"}
            <small className="text-muted ms-2">
              (Any one required)
            </small>
          </h6>

          {group.map(doc => {
            const uploaded = getUploadedDoc(doc);

            return (
              <div key={doc} className="mb-2">
                <label className="form-label">{doc}</label>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="form-control"
                  onChange={e =>
                    uploadSingleDocument(doc, e.target.files[0])
                  }
                />

                {uploaded && (
                  <small className="text-success">
                    ✔ Uploaded ({uploaded.fileSizeKB} KB)
                  </small>
                )}
              </div>
            );
          })}

          {!isAnyUploaded(group) && (
            <small className="text-danger">
              ✖ Upload at least one document from this section
            </small>
          )}
        </div>
      ))}

      {/* ================= STRICT REQUIRED DOCUMENTS ================= */}
      <div className="border rounded p-3">
        <h6 className="fw-semibold mb-2">
          Mandatory Documents
        </h6>

        {required.map(doc => {
          const uploaded = getUploadedDoc(doc);

          return (
            <div key={doc} className="mb-3">
              <label className="form-label fw-semibold">
                {doc}
              </label>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="form-control"
                onChange={e =>
                  uploadSingleDocument(doc, e.target.files[0])
                }
              />

              {uploaded ? (
                <small className="text-success">
                  ✔ Uploaded ({uploaded.fileSizeKB} KB)
                </small>
              ) : (
                <small className="text-danger">
                  ✖ Not uploaded
                </small>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= TOTAL SIZE ================= */}
      <div className="mt-3">
  <strong>Total Uploaded Size:</strong>{" "}
  {(formData.totalDocumentSizeKB / 1024).toFixed(2)} MB
  <span className="text-muted ms-2">
    (Max 100 MB)
  </span>
</div>
    </div>
  );
};

export default DocumentsUploadForm;
