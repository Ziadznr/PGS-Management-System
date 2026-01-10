import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import {
  getUserToken,
  removeUserSessions,
  setOTP,
  setEmail,
  setUserToken,
  setUserDetails
} from "../helper/SessionHelper";
import { SetUserProfile } from "../redux/state-slice/userProfile-slice";
import { BaseURL } from "../helper/config";

/* ================= AXIOS HEADERS ================= */

export const getAxiosHeaderOptional = () => {
  const token = getUserToken();
  return token ? { headers: { token } } : {};
};

export const getAxiosHeader = () => {
  const token = getUserToken();
  if (!token) removeUserSessions();
  return { headers: { token } };
};

/* ================= USER REGISTRATION ================= */

export async function UserRegisterRequest(formData) {
  try {
    store.dispatch(ShowLoader());
    const res = await axios.post(`${BaseURL}/users/register`, formData);
    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      SuccessToast("Registration Successful");
      return true;
    }

    ErrorToast(res.data?.data || "Registration Failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Something Went Wrong");
    return false;
  }
}

/* ================= USER LOGIN ================= */

export async function UserLoginRequest(email, password) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(`${BaseURL}/users/login`, {
      email,
      password
    });

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      const { token, data } = res.data;

      setUserToken(token);
      setUserDetails(data);

      store.dispatch(
        SetUserProfile({
          token,
          user: {
            id: data._id,
            name: data.name,
            email: data.email,
            role: data.role,
            faculty: data.faculty,
            department: data.department,
            photo: data.photo || "defaultPhoto.png"
          }
        })
      );

      SuccessToast("Login Successful");

      return {
        success: true,
        role: data.role
      };
    }

    ErrorToast("Invalid Email or Password");
    return { success: false };

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Login Failed");
    return { success: false };
  }
}

/* ================= USER PROFILE ================= */

export async function UserProfileRequest() {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.get(
      `${BaseURL}/users/profile`,
      getAxiosHeader()
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      store.dispatch(
        SetUserProfile({
          token: getUserToken(),
          user: res.data.data
        })
      );
      return res.data.data;
    }

    ErrorToast("Failed to load profile");
    return null;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server Error");
    return null;
  }
}

/* ================= UPDATE PROFILE ================= */

export async function UserUpdateRequest(userData) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/users/profile/update`,
      userData,
      getAxiosHeader()
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      store.dispatch(
        SetUserProfile({
          token: getUserToken(),
          user: res.data.data
        })
      );
      SuccessToast("Profile Updated");
      return true;
    }

    ErrorToast("Profile Update Failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Update Failed");
    return false;
  }
}

/* ================= PASSWORD RECOVERY ================= */

export async function UserRecoverVerifyEmailRequest(email) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.get(
      `${BaseURL}/users/recover/verify-email/${email}`
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      setEmail(email);
      SuccessToast("OTP sent to email");
      return true;
    }

    ErrorToast("Email not found");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Error sending OTP");
    return false;
  }
}

export async function UserRecoverVerifyOTPRequest(email, OTP) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/users/recover/verify-otp`,
      { email, OTP }
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      setOTP(OTP);
      SuccessToast("OTP Verified");
      return true;
    }

    ErrorToast("Invalid OTP");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("OTP Verification Failed");
    return false;
  }
}

export async function UserRecoverResetPassRequest(email, OTP, password) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/users/recover/reset-password`,
      { email, OTP, password }
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      SuccessToast("Password Reset Successful");
      return true;
    }

    ErrorToast("Reset Failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Error resetting password");
    return false;
  }
}

/* ================= ADMIN: USERS ================= */

export async function AdminUsersListRequest(
  pageNo,
  perPage,
  searchKeyword,
  role
) {
  try {
    store.dispatch(ShowLoader());

    const URL = `${BaseURL}/admin/users/list/${pageNo}/${perPage}/${searchKeyword || "0"}/${role}`;
    const res = await axios.get(URL, getAxiosHeader());

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      return res.data.data;
    }

    return [];

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Failed to load users");
    return [];
  }
}

export async function AdminDeleteUserRequest(userId) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.delete(
      `${BaseURL}/admin/users/delete/${userId}`,
      getAxiosHeader()
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      SuccessToast("User deleted");
      return true;
    }

    ErrorToast(res.data?.data || "Delete failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Failed to delete user");
    return false;
  }
}

export async function AdminSendEmailRequest(
  userId,
  subject,
  message,
  attachments = []
) {
  try {
    store.dispatch(ShowLoader());

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("subject", subject);
    formData.append("message", message);

    attachments.forEach(file =>
      formData.append("attachments", file)
    );

    const res = await axios.post(
      `${BaseURL}/admin/users/send-email`,
      formData,
      {
        headers: {
          ...getAxiosHeader().headers,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      SuccessToast("Email sent");
      return true;
    }

    ErrorToast("Email sending failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Failed to send email");
    return false;
  }
}

/* ================= DROPDOWNS ================= */

export async function FacultyDropdownRequest() {
  const res = await axios.get(`${BaseURL}/faculty/dropdown`);
  return res.data?.data || [];
}

export async function DepartmentDropdownRequest(facultyID) {
  const res = await axios.get(
    `${BaseURL}/department/dropdown/${facultyID || ""}`
  );
  return res.data?.data || [];
}

/*
⚠️ Backend REQUIRED:
GET /users/supervisors/:departmentID
*/
export async function SupervisorDropdownRequest(departmentID) {
  const res = await axios.get(
    `${BaseURL}/users/supervisors/${departmentID}`
  );
  return res.data?.data || [];
}
