import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../src/assets/css/LandingPage.css";

import Logo from "../../src/assets/images/pstu logo.png";
import Hadi from "../../src/assets/images/gate.jpg.jpeg";
import Gate from "../../src/assets/images/main.jpeg";
import Member from "../../src/assets/images/Dean Family.png";
import All from "../../src/assets/images/all.jpg";
import Graduate from "../../src/assets/images/Graduate.jpg";

import { GetLatestNoticeRequest } from "../APIRequest/NoticeAPIRequest";

const LandingPage = () => {
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= NOTICE =================
  useEffect(() => {
    (async () => {
      const data = await GetLatestNoticeRequest();
      setNotice(data);
      setLoading(false);
    })();
  }, []);

  // ================= SLIDER =================
  const slides = [Gate, All, Member, Hadi, Graduate];

  // clone first & last slide for infinite loop
  const extendedSlides = [
    slides[slides.length - 1],
    ...slides,
    slides[0],
  ];

  const [currentSlide, setCurrentSlide] = useState(0);   // start safe
const [transition, setTransition] = useState(false);
  const intervalRef = useRef(null);
  const initializedRef = useRef(false);

  // start auto slide (always forward)
  const startAutoSlide = () => {
    stopAutoSlide();
    intervalRef.current = setInterval(() => {
      setTransition(true);
      setCurrentSlide((prev) => prev + 1);
    }, 2000);
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // initialize slider AFTER first paint
useEffect(() => {
  if (initializedRef.current) return;
  initializedRef.current = true;

  // Step 1: allow first paint
  requestAnimationFrame(() => {
    // Step 2: jump to first real slide WITHOUT animation
    setTransition(false);
    setCurrentSlide(1);

    // Step 3: enable animation & auto-slide
    setTimeout(() => {
      setTransition(true);
      startAutoSlide();
    }, 50);
  });

  return stopAutoSlide;
}, []);

  // manual controls
  const handleNext = () => {
    setTransition(true);
    setCurrentSlide((prev) => prev + 1);
    startAutoSlide();
  };

  const handlePrev = () => {
    setTransition(true);
    setCurrentSlide((prev) => prev - 1);
    startAutoSlide();
  };

  // infinite loop correction
const handleTransitionEnd = () => {
  if (!transition) return;

  if (currentSlide === 0) {
    setTransition(false);
    setCurrentSlide(slides.length);
  }

  if (currentSlide === slides.length + 1) {
    setTransition(false);
    setCurrentSlide(1);
  }
};

  return (
    <div className="landing-container">

    {/* ================= HEADER ================= */}
<div className="header-wrapper">

  {/* ================= NOTICE ================= */}
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

  {/* ================= NAVBAR ================= */}
  <nav className="landing-navbar">
    <div className="nav-left">
      <img src={Logo} alt="PSTU Logo" className="nav-logo" />
    </div>

  <ul className="nav-links pill-nav">

  <li className="pill-item dropdown">
    <span className="pill-btn">
      Login / Registration
    </span>

    <ul className="dropdown-menu">
      <li onClick={() => navigate("/login")}>Admin Login</li>
      <li onClick={() => navigate("/users/login")}>Users Login</li>
      <li onClick={() => navigate("/student/login")}>Student Login</li>
    </ul>
  </li>

  <li className="pill-divider" />

  <li className="pill-item dropdown">
    <span className="pill-btn primary">
      Admission
    </span>

    <ul className="dropdown-menu">
      <li onClick={() => navigate("/ApplyAdmissionPage")}>
        Application
      </li>
      <li onClick={() => navigate("/admission/temporary-login")}>
        Temporary Login
      </li>
      <li className="disabled">More options coming soon</li>
    </ul>
  </li>

</ul>


  </nav>

</div>

      {/* ================= TITLE ================= */}
      <h1 className="landing-main-title">
        PSTU PGS Management System
      </h1>

      {/* ================= SLIDER ================= */}
      <div
        className="slider-container"
        onMouseEnter={stopAutoSlide}
        onMouseLeave={startAutoSlide}
      >
        {/* LEFT ARROW */}
        <button className="slider-arrow left" onClick={handlePrev}>
          ‹
        </button>

        {/* SLIDES */}
        <div
          className={`slider-track ${!transition ? "no-transition" : ""}`}
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedSlides.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Slide ${index}`}
              loading="lazy"          // ✅ LAZY LOAD
              draggable={false}
            />
          ))}
        </div>

        {/* RIGHT ARROW */}
        <button className="slider-arrow right" onClick={handleNext}>
          ›
        </button>
      </div>

    </div>
  );
};

export default LandingPage;
