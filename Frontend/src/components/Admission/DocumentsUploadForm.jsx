import axios from "axios";
import { BaseURL } from "../../helper/config";
import { ErrorToast, SuccessToast } from "../../helper/FormHelper";

const DocumentsUploadForm = ({ formData, setFormData }) => {

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > 30 * 1024 * 1024) {
      ErrorToast("Total upload size must be within 30 MB");
      return;
    }

    const data = new FormData();

    // 🔑 send existing tempId if exists (append more files)
    if (formData.tempId) {
      data.append("tempId", formData.tempId);
    }

    files.forEach(file => data.append("documents", file));

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

        SuccessToast("Documents uploaded successfully");
        e.target.value = "";
      } else {
        ErrorToast(res.data?.data || "Upload failed");
      }
    } catch (err) {
      ErrorToast("Document upload failed");
    }
  };

  return (
    <div className="card p-3 mt-3">
      <h6 className="fw-bold mb-2">📄 Required Documents</h6>

      <div className="alert alert-info">
        ℹ️ Documents are saved temporarily and will be attached when you submit
        the application.
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
