class SessionHelper {

  /* ================= USER TOKEN ================= */
  setToken(token) {
    localStorage.setItem("token", token);
  }

  getToken() {
    return localStorage.getItem("token");
  }

  removeToken() {
    localStorage.removeItem("token");
  }

  /* ================= ADMIN TOKEN ================= */
  setAdminToken(token) {
    localStorage.setItem("adminToken", token);
  }

  getAdminToken() {
    return localStorage.getItem("adminToken");
  }

  removeAdminToken() {
    localStorage.removeItem("adminToken");
  }

  /* ================= USER DETAILS ================= */
  setUserDetails(data) {
    localStorage.setItem("UserDetails", JSON.stringify(data));
  }

  getUserDetails() {
    const data = localStorage.getItem("UserDetails");
    if (!data || data === "undefined") return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  removeUserDetails() {
    localStorage.removeItem("UserDetails");
  }

  /* ================= TEMP ENROLLMENT ================= */
  setTempEnrollment(data) {
    localStorage.setItem("TempEnrollment", JSON.stringify(data));
  }

  getTempEnrollment() {
    const data = localStorage.getItem("TempEnrollment");
    if (!data) return null;
    return JSON.parse(data);
  }

  clearTempEnrollment() {
    localStorage.removeItem("TempEnrollment");
  }

  /* ================= EMAIL / OTP ================= */
  setEmail(email) {
    localStorage.setItem("Email", email);
  }

  getEmail() {
    return localStorage.getItem("Email");
  }

  setOTP(otp) {
    localStorage.setItem("OTP", otp);
  }

  getOTP() {
    return localStorage.getItem("OTP");
  }

  removeOTP() {
    localStorage.removeItem("OTP");
  }

  /* ================= LOGOUT ================= */
  removeSessions() {
    localStorage.clear();
    window.location.href = "/";
  }
}

const sessionHelper = new SessionHelper();

export const {
  setToken,
  getToken,
  removeToken,

  setAdminToken,
  getAdminToken,
  removeAdminToken,

  setUserDetails,
  getUserDetails,
  removeUserDetails,

  setTempEnrollment,
  getTempEnrollment,
  clearTempEnrollment,

  setEmail,
  getEmail,
  setOTP,
  getOTP,
  removeOTP,

  removeSessions
} = sessionHelper;
