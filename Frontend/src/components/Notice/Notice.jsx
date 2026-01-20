import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  CreateNoticeRequest,
  UpdateNoticeRequest,
  DeleteNoticeRequest,
  ToggleNoticePinRequest,
  ToggleNoticeLockRequest,
  GetAdminNoticeListRequest
} from "../../APIRequest/NoticeAPIRequest";
import { IsEmpty, ErrorToast } from "../../helper/FormHelper";

const Notice = () => {
  const [notices, setNotices] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    expireAt: "",
    isPublic: true // ✅ DEFAULT PUBLIC
  });

  // ================= LOAD NOTICES =================
  const loadNotices = async () => {
    const data = await GetAdminNoticeListRequest();
    setNotices(data || []);
  };

  useEffect(() => {
    loadNotices();
  }, []);

  // ================= CREATE NOTICE =================
  const createNotice = async () => {
    if (IsEmpty(form.title) || IsEmpty(form.description)) {
      ErrorToast("Title and description required");
      return;
    }

    const success = await CreateNoticeRequest(form);
    if (success) {
      setForm({
        title: "",
        description: "",
        expireAt: "",
        isPublic: true
      });
      loadNotices();
    }
  };

  // ================= EDIT NOTICE =================
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
        <input id="expire" type="date" class="swal2-input"
          value="${notice.expireAt?.substring(0, 10) || ""}">
      `,
      showCancelButton: true,
      confirmButtonText: "Update",
      preConfirm: () => ({
        title: document.getElementById("title").value,
        description: document.getElementById("desc").value,
        expireAt: document.getElementById("expire").value || null
      })
    });

    if (!value) return;

    const success = await UpdateNoticeRequest(notice._id, value);
    if (success) loadNotices();
  };

  // ================= DELETE NOTICE =================
  const deleteNotice = async (notice) => {
    if (notice.isLocked) {
      ErrorToast("Locked notice cannot be deleted");
      return;
    }
    const success = await DeleteNoticeRequest(notice._id);
    if (success) loadNotices();
  };

  // ================= UI =================
  return (
    <div className="container-fluid my-4">

      {/* ================= CREATE NOTICE ================= */}
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
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />
            </div>

            <div className="col-md-4">
              <textarea
                className="form-control"
                placeholder="Notice description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={form.expireAt}
                onChange={(e) =>
                  setForm({ ...form, expireAt: e.target.value })
                }
              />
            </div>

            <div className="col-md-2 d-flex align-items-center">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={form.isPublic}
                  onChange={(e) =>
                    setForm({ ...form, isPublic: e.target.checked })
                  }
                />
                <label className="form-check-label">
                  Public
                </label>
              </div>
            </div>

            <div className="col-md-1">
              <button className="btn btn-success w-100" onClick={createNotice}>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= NOTICE LIST ================= */}
      <div className="card">
        <div className="card-body">
          <h5>All Notices</h5>

          <table className="table table-bordered mt-3 align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Status</th>
                <th>Expire</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {notices.length > 0 ? (
                notices.map((n, i) => (
                  <tr key={n._id}>
                    <td>{i + 1}</td>
                    <td>{n.title}</td>

                    <td>
                      {n.isPublic ? (
                        <span className="badge bg-success me-1">Public</span>
                      ) : (
                        <span className="badge bg-secondary me-1">Private</span>
                      )}

                      {n.isPinned && (
                        <span className="badge bg-primary me-1">Pinned</span>
                      )}

                      {n.isLocked && (
                        <span className="badge bg-danger">Locked</span>
                      )}
                    </td>

                    <td>
                      {n.expireAt
                        ? new Date(n.expireAt).toLocaleDateString()
                        : "-"}
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
