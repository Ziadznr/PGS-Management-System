import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import { getAdminToken, setEmail, setOTP, setAdminToken, setUserDetails } from "../helper/SessionHelper";
import { SetProfile } from "../redux/state-slice/profile-slice";
import { BaseURL } from "../helper/config";

// Helper to get fresh Axios headers with current token
const getAxiosHeader = () => {
  const token = getAdminToken();
  if (!token) {
    ErrorToast("Please login first");
  }
  return {
    headers: {
      token: token // or use Authorization: `Bearer ${token}` if backend expects that
    }
  };
};

export async function LoginRequest(email, password) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(`${BaseURL}/admin/login`, { email, password });

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data.status === "success") {
      // ✅ save token
      setAdminToken(res.data.token);

      // ✅ LOAD FULL PROFILE USING TOKEN
      await GetProfileDetails();

      SuccessToast("Login Success");
      return true;
    }

    ErrorToast("Invalid Email or Password");
    return false;

  } catch (e) {
    store.dispatch(HideLoader());
    ErrorToast("Invalid Email or Password");
    return false;
  }
}



export async function RegistrationRequest(email, firstName, lastName, mobile, password, photo) {
  try {
    store.dispatch(ShowLoader());
    let URL = BaseURL + "/admin/register";
    let PostBody = { email, firstName, lastName, mobile, password, photo };
    let res = await axios.post(URL, PostBody);
    store.dispatch(HideLoader());
    if (res.status === 200) {
      if (res.data["status"] === "fail") {
        if (res.data["data"]["keyPattern"]["email"] === 1) {
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

export async function GetProfileDetails() {
  try {
    const headers = getAxiosHeader();
    if (!headers.headers.token) return false;

    store.dispatch(ShowLoader());

    const res = await axios.get(`${BaseURL}/admin/profile`, headers);

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data.status === "success") {
      store.dispatch(SetProfile(res.data.data[0]));
      return true;
    }

    ErrorToast("Failed to load profile");
    return false;

  } catch (e) {
    store.dispatch(HideLoader());
    ErrorToast("Something Went Wrong");
    return false;
  }
}


export async function ProfileUpdateRequest(firstName, lastName, mobile, photo) {
  try {
    const headers = getAxiosHeader();
    if (!headers.headers.token) return false;

    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admin/profile/update`,
      { firstName, lastName, mobile, photo },
      headers
    );

    store.dispatch(HideLoader());

    if (res.data.status === "success") {
      SuccessToast("Profile Updated");
      await GetProfileDetails(); // reload from DB
      return true;
    }

    ErrorToast("Profile update failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server error");
    return false;
  }
}



export async function RecoverVerifyEmailRequest(email) {
  try {
    store.dispatch(ShowLoader());
    let URL = BaseURL + "/admin/recover/verify-email/" + email;
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
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}

export async function RecoverVerifyOTPRequest(email, OTP) {
  try {
    store.dispatch(ShowLoader());
    let URL = BaseURL + "/admin/recover/verify-otp/" + email + "/" + OTP;
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
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());

    return false;
  }
}

export async function RecoverResetPassRequest(email, OTP, password) {
  try {
    store.dispatch(ShowLoader());
    let URL = BaseURL + "/admin/recover/reset-password";
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
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}
