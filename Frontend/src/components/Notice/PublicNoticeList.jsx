import React, { useEffect, useState } from "react";
import { GetPublicNoticesRequest } from "../../APIRequest/NoticeAPIRequest";
import { BaseURL } from "../../helper/config";

const PublicNoticeList = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await GetPublicNoticesRequest();
      setNotices(data || []);
    })();
  }, []);

  const resolveAttachment = (path) => {
    if (!path) return null;
    return `${BaseURL.replace("/api/v1", "")}${path}`;
  };

  return (
    <div className="container my-4">
  <h4 className="mb-4">📢 All Notices</h4>

  {notices.length === 0 && (
    <p className="text-muted">No notices available</p>
  )}

  {notices.map((n) => (
    <div
      key={n._id}
      className={`card notice-card mb-3 ${n.isPinned ? "notice-pinned" : ""}`}
    >
      <div className="card-body d-flex justify-content-between align-items-start gap-3">

        {/* LEFT CONTENT */}
        <div className="notice-content">
          <h6 className="mb-1">
            {n.isPinned && <span className="me-1">📌</span>}
            {n.title}
          </h6>

          <p className="mb-2 text-muted small">
            {n.description}
          </p>

          <small className="text-muted">
            📅 {new Date(n.createdAt).toLocaleDateString()}
          </small>
        </div>

        {/* RIGHT ACTION */}
        {n.attachment && (
          <div className="notice-action text-end">
            <a
              href={resolveAttachment(n.attachment)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-outline-primary mb-2"
            >
              👁 View
            </a>

            <br />

            {/* <a
              href={resolveAttachment(n.attachment)}
              download
              className="btn btn-sm btn-primary"
            >
              ⬇ Download
            </a> */}
          </div>
        )}

      </div>
    </div>
  ))}
</div>

  );
};

export default PublicNoticeList;
