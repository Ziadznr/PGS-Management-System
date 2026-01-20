import axios from "axios";
import { BaseURL } from "../../helper/config";
import { ErrorToast } from "../../helper/FormHelper";

const DocumentsUploadForm = ({ formData, setFormData }) => {

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);

    let totalSize = files.reduce(
      (sum, f) => sum + f.size,
      0
    );

    if (totalSize > 30 * 1024 * 1024) {
      ErrorToast("Total upload size must be within 30 MB");
      return;
    }

    const data = new FormData();
    files.forEach(f => data.append("documents", f));

    try {
      const res = await axios.post(
        `${BaseURL}/admission/upload-documents`,
        data
      );

      if (res.data?.status === "success") {
        setFormData(prev => ({
          ...prev,
          documents: res.data.data.documents,
          totalDocumentSizeKB:
            res.data.data.totalSizeKB
        }));
      }
    } catch {
      ErrorToast("Document upload failed");
    }
  };

  return (
    <div className="card p-3 mt-3">
      <div className="mb-3">
  <h6 className="fw-bold mb-2">📄 Required Documents</h6>

  <ol className="ps-3">
    <li className="mb-2">
      Clearance certificate from the respective employer, attested copies of
      all academic certificates, mark sheets / transcripts, nationality
      certificate, testimonial, and recent passport-size photographs.
    </li>

    <li className="mb-2">
      <strong>For PhD Applicants only:</strong> A synopsis of the proposed
      dissertation work (within <strong>3–4 pages</strong>), recommended by the
      proposed supervisor and forwarded by the concerned Chairman.
    </li>
  </ol>
      <p className="text-muted fst-italic">
  *The total size of all uploaded documents must not exceed 30&nbsp;MB.*
</p>

</div>
      <input
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        className="form-control"
        onChange={handleUpload}
      />

      {formData.documents?.length > 0 && (
        <ul className="mt-2">
          {formData.documents.map((d, i) => (
            <li key={i}>
              {d.title} ({d.fileSizeKB} KB)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentsUploadForm;
