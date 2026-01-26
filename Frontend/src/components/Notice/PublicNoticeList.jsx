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
      <h4>📢 All Notices</h4>

      {notices.length === 0 && <p>No notices available</p>}

      {notices.map((n) => (
        <div key={n._id} className="card mb-3">
          <div className="card-body">

            <h6>
              {n.isPinned && "📌 "} {n.title}
            </h6>

            <p>{n.description}</p>

            {/* 📎 ATTACHMENT */}
            {n.attachment && (
              <a
                href={resolveAttachment(n.attachment)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-primary mt-2"
              >
                📎 View Attachment
              </a>
            )}

            <div className="mt-2">
              <small className="text-muted">
                {new Date(n.createdAt).toLocaleDateString()}
              </small>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};

export default PublicNoticeList;
