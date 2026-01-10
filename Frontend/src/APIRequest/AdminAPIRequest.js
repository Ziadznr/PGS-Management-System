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
      token: token // or use Authorization: `Bearer ${token}` if backend expects that
    }
  };
};

export async function LoginRequest(email, password) {
    try {
        store.dispatch(ShowLoader());

        const res = await axios.post(`${BaseURL}/Login`, { email, password });

        store.dispatch(HideLoader());

        if (res.status === 200) {
            const userData = res.data["data"];
            setToken(res.data["token"]);
            setUserDetails(userData);

            // ✅ Update Redux profile immediately
            store.dispatch(SetProfile(userData));

            SuccessToast("Login Success");
            return true;
        } else {
            ErrorToast("Invalid Email or Password");
            return false;
        }
    } catch (e) {
        store.dispatch(HideLoader());
        ErrorToast("Invalid Email or Password");
        return false;
    }
}

export async function RegistrationRequest(email, firstName, lastName, mobile, password, photo) {
  try {
    store.dispatch(ShowLoader());
    let URL = BaseURL + "/Registration";
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
    let URL = BaseURL + "/ProfileDetails";
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

export async function ProfileUpdateRequest(email, firstName, lastName, mobile, password, photo) {
  try {
    const headers = getAxiosHeader();
    if (!headers.headers.token) return false;

    store.dispatch(ShowLoader());
    let URL = BaseURL + "/ProfileUpdate";
    let PostBody = { email, firstName, lastName, mobile, password, photo };
    let UserDetails = { email, firstName, lastName, mobile, photo };
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
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}

export async function RecoverVerifyEmailRequest(email) {
  try {
    store.dispatch(ShowLoader());
    let URL = BaseURL + "/RecoverVerifyEmail/" + email;
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
    let URL = BaseURL + "/RecoverVerifyOTP/" + email + "/" + OTP;
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
    let URL = BaseURL + "/RecoverResetPass";
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
