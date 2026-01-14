class SessionHelper {

  // ================= USER TOKEN =================
  setToken(token) {
    localStorage.setItem("token", token);
  }

  getToken() {
    return localStorage.getItem("token");
  }

  removeToken() {
    localStorage.removeItem("token");
  }

  // ================= ADMIN TOKEN =================
  setAdminToken(token) {
    localStorage.setItem("adminToken", token);
  }

  getAdminToken() {
    return localStorage.getItem("adminToken");
  }

  removeAdminToken() {
    localStorage.removeItem("adminToken");
  }

  // ================= USER DETAILS =================
  setUserDetails(UserDetails) {
    localStorage.setItem("UserDetails", JSON.stringify(UserDetails));
  }

  getUserDetails() {
    const userDetails = localStorage.getItem("UserDetails");

    if (!userDetails || userDetails === "undefined") {
      return null;
    }

    try {
      return JSON.parse(userDetails);
    } catch (error) {
      console.error("Failed to parse UserDetails:", error);
      return null;
    }
  }

  removeUserDetails() {
    localStorage.removeItem("UserDetails");
  }

  // ================= EMAIL / OTP =================
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

  // ================= LOGOUT / CLEAR =================
  removeSessions() {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("UserDetails");
    localStorage.removeItem("Email");
    localStorage.removeItem("OTP");

    window.location.href = "/";
  }
}

const sessionHelper = new SessionHelper();

export const {
  // user
  setToken,
  getToken,
  removeToken,

  // admin
  setAdminToken,
  getAdminToken,
  removeAdminToken,

  // user details
  setUserDetails,
  getUserDetails,
  removeUserDetails,

  // email / otp
  setEmail,
  getEmail,
  setOTP,
  getOTP,
  removeOTP,

  // logout
  removeSessions
} = sessionHelper;
