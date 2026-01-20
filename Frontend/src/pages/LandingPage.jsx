import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../src/assets/css/LandingPage.css";
import Logo from "../../src/assets/images/ps.png";
import { GetLatestNoticeRequest } from "../APIRequest/NoticeAPIRequest";

const LandingPage = () => {
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= LOAD PUBLIC NOTICE =================
  useEffect(() => {
    (async () => {
      const data = await GetLatestNoticeRequest();
      setNotice(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="landing-container">

      {/* ================= PUBLIC NOTICE TICKER ================= */}
      {!loading && notice && (
        <div className="notice-ticker">
          <div className="notice-text">
            📢 <strong>{notice.title}</strong> — {notice.description}
          </div>

          <span
            className="view-all-link"
            onClick={() => navigate("/notices")}
          >
            View all
          </span>
        </div>
      )}

      {/* ================= MAIN HEADING ================= */}
      <h1 className="landing-main-title">
        PSTU PGS Management System
      </h1>

      {/* ================= LOGO ================= */}
      <div className="logo-wrapper">
        <img
          src={Logo}
          alt="PSTU Logo"
          className="landing-logo"
        />
      </div>

      {/* ================= APPLY FOR ADMISSION (NEW) ================= */}
      <div className="apply-admission-card">
        <h2>Admission Application</h2>
        <p>
          Apply online for MBA / MS / PhD programs  
          <br />
          <strong>No login required</strong>
        </p>

        <button
          className="apply-btn"
          onClick={() => navigate("/ApplyAdmissionPage")}
        >
          Apply for Admission
        </button>
      </div>

      {/* ================= LOGIN CARD ================= */}
      <div className="landing-card">
        <h2 className="landing-title">Welcome</h2>
        <p className="landing-subtitle">
          Please select your login type to continue
        </p>

        <div className="landing-buttons">
          <button
            className="landing-btn login-btn"
            onClick={() => navigate("/login")}
          >
            Admin Login / Registration
          </button>

          <button
            className="landing-btn chairman-btn"
            onClick={() => navigate("/users/login")}
          >
            Users Login / Registration
          </button>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
