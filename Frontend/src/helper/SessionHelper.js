class SessionHelper {
    setToken(token) {
        localStorage.setItem("token", token);
    }
    getToken() {
        return localStorage.getItem("token");
    }
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

    setEmail(Email) {
        localStorage.setItem("Email", Email);
    }
    getEmail() {
        return localStorage.getItem("Email");
    }
    setOTP(OTP) {
        localStorage.setItem("OTP", OTP);
    }
    getOTP() {
        return localStorage.getItem("OTP");
    }
    removeSessions = () => {
        localStorage.clear();
        window.location.href = "/Start";
    };
}

const sessionHelper = new SessionHelper();

export const {
    setEmail,
    getEmail,
    setOTP,
    getOTP,
    setToken,
    getToken,
    setUserDetails,
    getUserDetails,
    removeSessions
} = sessionHelper;
