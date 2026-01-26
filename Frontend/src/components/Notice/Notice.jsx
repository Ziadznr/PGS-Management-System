import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  CreateNoticeRequest,
  UpdateNoticeRequest,
  DeleteNoticeRequest,
  ToggleNoticePinRequest,
  ToggleNoticeLockRequest,
  ToggleNoticePublicRequest,
  GetAdminNoticeListRequest
} from "../../APIRequest/NoticeAPIRequest";
import { IsEmpty, ErrorToast } from "../../helper/FormHelper";
import { BaseURL } from "../../helper/config";

const Notice = () => {
  const [notices, setNotices] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    isPublic: true,
    attachment: null
  });

  /* ================= LOAD ================= */
  const loadNotices = async () => {
    const data = await GetAdminNoticeListRequest();
    setNotices(data || []);
  };

  useEffect(() => {
    loadNotices();
  }, []);

  /* ================= CREATE ================= */
  const createNotice = async () => {
    if (IsEmpty(form.title) || IsEmpty(form.description)) {
      ErrorToast("Title and description required");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("isPublic", form.isPublic);

    if (form.attachment) {
      formData.append("attachment", form.attachment);
    }

    const success = await CreateNoticeRequest(formData);

    if (success) {
      setForm({
        title: "",
        description: "",
        isPublic: true,
        attachment: null
      });
      loadNotices();
    }
  };

  /* ================= EDIT ================= */
  const editNotice = async (notice) => {
    if (notice.isLocked) {
      ErrorToast("This notice is locked");
      return;
    }

    const { value } = await Swal.fire({
      title: "Edit Notice",
      html: `
        <input id="title" class="swal2-input" value="${notice.title}">
        <textarea id="desc" class="swal2-textarea">${notice.description}</textarea>
        <label style="margin-top:10px">
          <input type="checkbox" id="isPublic" ${notice.isPublic ? "checked" : ""}>
          Public
        </label>
      `,
      showCancelButton: true,
      confirmButtonText: "Update",
      preConfirm: () => ({
        title: document.getElementById("title").value,
        description: document.getElementById("desc").value,
        isPublic: document.getElementById("isPublic").checked
      })
    });

    if (!value) return;

    const formData = new FormData();
    Object.entries(value).forEach(([k, v]) =>
      formData.append(k, v)
    );

    const success = await UpdateNoticeRequest(notice._id, formData);
    if (success) loadNotices();
  };

  /* ================= DELETE ================= */
  const deleteNotice = async (notice) => {
    if (notice.isLocked) {
      ErrorToast("Locked notice cannot be deleted");
      return;
    }
    const success = await DeleteNoticeRequest(notice._id);
    if (success) loadNotices();
  };

  /* ================= UI ================= */
  return (
    <div className="container-fluid my-4">

      {/* CREATE */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>Create Notice</h5>
          <hr />

          <div className="row g-2">
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Notice title"
                value={form.title}
                onChange={e =>
                  setForm({ ...form, title: e.target.value })
                }
              />
            </div>

            <div className="col-md-4">
              <textarea
                className="form-control"
                placeholder="Notice description"
                value={form.description}
                onChange={e =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="col-md-3">
              <input
                type="file"
                className="form-control"
                onChange={e =>
                  setForm({ ...form, attachment: e.target.files[0] })
                }
              />
            </div>

            <div className="col-md-1 d-flex align-items-center">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={e =>
                  setForm({ ...form, isPublic: e.target.checked })
                }
              />{" "}
              <span className="ms-1">Public</span>
            </div>

            <div className="col-md-1">
              <button className="btn btn-success w-100" onClick={createNotice}>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="card">
        <div className="card-body">
          <h5>All Notices</h5>

          <table className="table table-bordered mt-3 align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Status</th>
                <th>Attachment</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {notices.length ? (
                notices.map((n, i) => (
                  <tr key={n._id}>
                    <td>{i + 1}</td>
                    <td>{n.title}</td>

                    <td>
                      <span className={`badge me-1 ${n.isPublic ? "bg-success" : "bg-secondary"}`}>
                        {n.isPublic ? "Public" : "Private"}
                      </span>
                      {n.isPinned && <span className="badge bg-primary me-1">Pinned</span>}
                      {n.isLocked && <span className="badge bg-danger">Locked</span>}
                    </td>

                    <td>
                      {n.attachment ? (
                        <a
                          href={`${BaseURL.replace("/api/v1", "")}${n.attachment}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>
                      <button
                        className="btn btn-sm btn-warning me-1"
                        disabled={n.isLocked}
                        onClick={() => editNotice(n)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-info me-1"
                        onClick={() =>
                          ToggleNoticePublicRequest(n._id).then(loadNotices)
                        }
                      >
                        {n.isPublic ? "Private" : "Public"}
                      </button>

                      <button
                        className="btn btn-sm btn-secondary me-1"
                        onClick={() =>
                          ToggleNoticePinRequest(n._id).then(loadNotices)
                        }
                      >
                        {n.isPinned ? "Unpin" : "Pin"}
                      </button>

                      <button
                        className="btn btn-sm btn-dark me-1"
                        onClick={() =>
                          ToggleNoticeLockRequest(n._id).then(loadNotices)
                        }
                      >
                        {n.isLocked ? "Unlock" : "Lock"}
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        disabled={n.isLocked}
                        onClick={() => deleteNotice(n)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No notices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Notice;
