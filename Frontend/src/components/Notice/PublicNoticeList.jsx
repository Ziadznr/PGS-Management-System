import React, { useEffect, useState } from "react";
import { GetPublicNoticesRequest } from "../../APIRequest/NoticeAPIRequest";

const PublicNoticeList = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await GetPublicNoticesRequest();
      setNotices(data);
    })();
  }, []);

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
            <small className="text-muted">
              {new Date(n.createdAt).toLocaleDateString()}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PublicNoticeList;
