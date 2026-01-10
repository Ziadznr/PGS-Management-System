import React from "react";
import { useNavigate } from "react-router-dom";
import "../../src/assets/css/LandingPage.css";
import Logo from "../../src/assets/images/ps.png";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Main heading outside the form */}
      <h1 className="landing-main-title">PSTU PGS Management System</h1>

      {/* Centered Logo */}
      <div className="logo-wrapper">
        <img src={Logo} alt="PSTU Logo" className="landing-logo" />
      </div>

      {/* Login form card */}
      <div className="landing-card">
        <h2 className="landing-title">Welcome</h2>
        <p className="landing-subtitle">
          Please select your login type to continue
        </p>

        <div className="landing-buttons">
          <button
            className="landing-btn login-btn"
            onClick={() => navigate("/Login")}
          >
            Admin Login / Registration
          </button>
          <button
            className="landing-btn chairman-btn"
            onClick={() => navigate("/CustomerLogin")}
          >
            Teacher Login / Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
