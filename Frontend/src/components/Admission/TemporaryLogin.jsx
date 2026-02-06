import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorToast, IsEmpty } from "../../helper/FormHelper";
import { TemporaryLoginRequest } from "../../APIRequest/AdmissionAPIRequest";
import logo from "../../assets/images/ps.png";

const TemporaryLogin = () => {
  const navigate = useNavigate();

  const [tempLoginId, setTempLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* 🔒 STATE CONTROL */
  const [blocked, setBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState("");

  /* ⏳ COUNTDOWN */
  const [deadline, setDeadline] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  /* ================= COUNTDOWN EFFECT ================= */
  useEffect(() => {
    if (!deadline) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = new Date(deadline) - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        setBlocked(true);
        setBlockMessage("⛔ Enrollment time expired");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  /* ================= SUBMIT ================= */
  const submitLogin = async () => {
    if (IsEmpty(tempLoginId)) {
      ErrorToast("Temporary Login ID required");
      return;
    }

    if (IsEmpty(password)) {
      ErrorToast("Password required");
      return;
    }

    setLoading(true);
    const result = await TemporaryLoginRequest(
      tempLoginId.trim(),
      password.trim()
    );
    setLoading(false);

    if (!result) {
      setPassword("");
      return;
    }

    // ✅ success
    setDeadline(result.enrollmentDeadline);

    // redirect after short delay (UX)
    setTimeout(() => {
      navigate(`/enrollment/${result.applicationId}`, {
        state: result
      });
    }, 1200);
  };

  /* ================= BLOCKED VIEW ================= */
  if (blocked) {
    return (
      <div className="container center-screen">
        <div className="card p-4 text-center login-card">
          <img src={logo} className="login-logo mb-3" alt="Logo" />
          <h4 className="text-danger">Access Blocked</h4>
          <p className="text-muted mt-2">{blockMessage}</p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6 center-screen">
          <div className="card login-card p-4">
            <div className="card-body text-center">

              {/* Logo */}
              <img src={logo} className="login-logo" alt="Logo" />

              <h3>Temporary Login</h3>
              <small className="text-muted d-block mb-3">
                Enrollment Access (After Dean Approval)
              </small>

              {/* ⏳ COUNTDOWN */}
              {deadline && (
                <div className="alert alert-warning py-2">
                  ⏳ Time left to enroll: <b>{timeLeft}</b>
                </div>
              )}

              {/* LOGIN ID */}
              <input
                className="form-control mb-3"
                placeholder="Temporary Login ID"
                value={tempLoginId}
                onChange={e => setTempLoginId(e.target.value)}
                disabled={loading}
              />

              {/* PASSWORD */}
              <div className="position-relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Temporary Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>

              {/* BUTTON */}
              <button
                className="btn login-btn w-100"
                onClick={submitLogin}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Proceed to Enrollment"}
              </button>

              <small className="text-muted d-block mt-4">
                ⚠ Temporary login can be used only once
              </small>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemporaryLogin;
