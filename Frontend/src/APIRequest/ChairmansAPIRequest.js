import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import { getToken, setEmail, setOTP, setToken, setUserDetails } from "../helper/SessionHelper";
import { SetProfile } from "../redux/state-slice/profile-slice";
import { BaseURL } from "../helper/config";

// Helper to get fresh Axios headers with current token
const getAxiosHeader = () => {
  const token = getToken();
  if (!token) {
    ErrorToast("Please login first");
  }
  return {
    headers: {
      token: token
    }
  };
};

// ----------------- Chairman Login -----------------
export async function ChairmanLoginRequest(email, password) {
  try {
    store.dispatch(ShowLoader());
    let URL = BaseURL + "/ChairmanLogin";
    let PostBody = { email, password };
    let res = await axios.post(URL, PostBody);
    setToken(res.data["token"]);
    setUserDetails(res.data["data"]);
    SuccessToast("Login Success");
    store.dispatch(HideLoader());
    return true;
  } catch (e) {
    store.dispatch(HideLoader());
    ErrorToast("Invalid Email or Password");
    return false;
  }
}

// ----------------- Chairman Registration -----------------
export async function ChairmanRegistrationRequest(email, firstName, lastName, mobile, password, photo, departmentId) {
  try {
    store.dispatch(ShowLoader());
    let URL = BaseURL + "/ChairmanRegistration";
    let PostBody = { email, firstName, lastName, mobile, password, photo, departmentId };
    let res = await axios.post(URL, PostBody);
    store.dispatch(HideLoader());
    if (res.status === 200) {
      if (res.data["status"] === "fail") {
        if (res.data["data"]["keyPattern"]?.email === 1) {
          ErrorToast("Email Already Exist");
          return false;
        } else {
          ErrorToast("Something Went Wrong");
          return false;
        }
      } else {
        SuccessToast("Registration Success");
        return true;
      }
    } else {
      ErrorToast("Something Went Wrong");
      return false;
    }
  } catch (e) {
    store.dispatch(HideLoader());
    ErrorToast("Something Went Wrong");
    return false;
  }
}

// ----------------- Get Chairman Profile -----------------
export async function ChairmanGetProfile() {
  try {
    const headers = getAxiosHeader();
    if (!headers.headers.token) return false;

    store.dispatch(ShowLoader());
    let URL = BaseURL + "/ChairmanProfileDetails";
    let res = await axios.get(URL, headers);
    store.dispatch(HideLoader());
    if (res.status === 200) {
      store.dispatch(SetProfile(res.data["data"][0]));
    } else {
      ErrorToast("Something Went Wrong");
    }
  } catch (e) {
    store.dispatch(HideLoader());
    ErrorToast("Something Went Wrong");
  }
}

// ----------------- Update Chairman Profile -----------------
export async function ChairmanProfileUpdateRequest(email, firstName, lastName, mobile, password, photo, departmentId) {
  try {
    const headers = getAxiosHeader();
    if (!headers.headers.token) return false;

    store.dispatch(ShowLoader());
    let URL = BaseURL + "/ChairmanProfileUpdate";
    let PostBody = { email, firstName, lastName, mobile, password, photo, departmentId };
    let UserDetails = { email, firstName, lastName, mobile, photo, departmentId };
    let res = await axios.post(URL, PostBody, headers);
    store.dispatch(HideLoader());
    if (res.status === 200) {
      SuccessToast("Profile Update Success");
      setUserDetails(UserDetails);
      return true;
    } else {
      ErrorToast("Something Went Wrong");
      return false;
    }
  } catch (e) {
    store.dispatch(HideLoader());
    ErrorToast("Something Went Wrong");
    return false;
  }
}

// ----------------- Recover Verify Email -----------------
export async function ChairmanRecoverVerifyEmailRequest(email) {
  try {
    store.dispatch(ShowLoader());
    let URL = BaseURL + "/ChairmanRecoverVerifyEmail/" + email;
    let res = await axios.get(URL);
    store.dispatch(HideLoader());
    if (res.status === 200) {
      if (res.data["status"] === "fail") {
        ErrorToast("No user found");
        return false;
      } else {
        setEmail(email);
        SuccessToast("A 6 Digit verification code has been sent to your email address.");
        return true;
      }
    } else {
      ErrorToast("Something Went Wrong");
      return false;
    }
  } catch (e) {
    store.dispatch(HideLoader());
    ErrorToast("Something Went Wrong");
    return false;
  }
}

// ----------------- Recover Verify OTP -----------------
export async function ChairmanRecoverVerifyOTPRequest(email, OTP) {
  try {
    store.dispatch(ShowLoader());
    let URL = BaseURL + "/ChairmanRecoverVerifyOTP/" + email + "/" + OTP;
    let res = await axios.get(URL);
    store.dispatch(HideLoader());
    if (res.status === 200) {
      if (res.data["status"] === "fail") {
        ErrorToast("Code Verification Fail");
        return false;
      } else {
        setOTP(OTP);
        SuccessToast("Code Verification Success");
        return true;
      }
    } else {
      ErrorToast("Something Went Wrong");
      return false;
    }
  } catch (e) {
    store.dispatch(HideLoader());
    ErrorToast("Something Went Wrong");
    return false;
  }
}

// ----------------- Recover Reset Password -----------------
export async function ChairmanRecoverResetPassRequest(email, OTP, password) {
  try {
    store.dispatch(ShowLoader());
    let URL = BaseURL + "/ChairmanRecoverResetPass";
    let PostBody = { email, OTP, password };
    let res = await axios.post(URL, PostBody);
    store.dispatch(HideLoader());
    if (res.status === 200) {
      if (res.data["status"] === "fail") {
        ErrorToast(res.data["data"]);
        return false;
      } else {
        setOTP(OTP);
        SuccessToast("NEW PASSWORD CREATED");
        return true;
      }
    } else {
      ErrorToast("Something Went Wrong");
      return false;
    }
  } catch (e) {
    store.dispatch(HideLoader());
    ErrorToast("Something Went Wrong");
    return false;
  }
}

// ----------------- Get Departments Dropdown -----------------
export async function PublicDepartmentsDropdown() {
  try {
    store.dispatch(ShowLoader());
    let URL = BaseURL + "/PublicDepartments"; // public route
    let res = await axios.get(URL);
    store.dispatch(HideLoader());
    if (res.status === 200 && res.data.status === "success") {
      return res.data.data; // array of {_id, Name}
    } else {
      ErrorToast("Failed to fetch departments");
      return [];
    }
  } catch (e) {
    store.dispatch(HideLoader());
    ErrorToast("Something Went Wrong");
    return [];
  }
}

