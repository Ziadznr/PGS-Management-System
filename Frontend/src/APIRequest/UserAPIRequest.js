import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import {
  getToken,
  getAdminToken,
  removeSessions,
  setOTP,
  setEmail,
  setToken,
  setUserDetails
} from "../helper/SessionHelper";
import { SetUserProfile } from "../redux/state-slice/userProfile-slice";
import { BaseURL } from "../helper/config";

/* ================= AXIOS HEADERS ================= */

export const getAxiosHeaderOptional = () => {
  const token = getToken();
  return token ? { headers: { token } } : {};
};

export const getAxiosHeader = () => {
  const token = getToken();
  if (!token) removeSessions();
  return { headers: { token } };
};

export const getAdminAxiosHeader = () => {
  const token = getAdminToken();
  if (!token) {
    throw new Error("Admin token missing");
  }
  return { headers: { token } };
};



export async function AdminCreateUpdateUserRequest(payload) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admin/users/create-update`,
      payload,
      getAdminAxiosHeader()
    );

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
      SuccessToast("User created & email sent");
      return true;
    }

    ErrorToast(res.data?.data || "Failed to create user");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server error");
    return false;
  }
}


/* ================= USER REGISTRATION ================= */

export async function StudentRegisterRequest(formData) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/users/student-register`,
      formData
    );

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
      SuccessToast("Registration successful. Please login.");
      return true;
    }

    ErrorToast(res.data?.data || "Registration failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Something went wrong");
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

    if (res.data?.status === "success") {
      const { token, data } = res.data;

      setToken(token);
      setUserDetails(data);

      store.dispatch(
        SetUserProfile({
          token,
          user: data
        })
      );

      SuccessToast("Login successful");

      return {
        success: true,
        role: data.role,
        isFirstLogin: data.isFirstLogin
      };
    }

    ErrorToast(res.data?.data || "Invalid credentials");
    return { success: false };

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Login failed");
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
          token: getToken(),
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
      await UserProfileRequest(); // ✅ FIX
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

export async function UserRecoverVerifyOTPRequest(email, otp) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/users/recover/verify-otp`,
      { email, otp }   // ✅ lowercase
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      setOTP(otp);
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

export async function AdminUsersListRequest(
  pageNo,
  perPage,
  searchKeyword,
  role
) {
  const token = getAdminToken();

  if (!token) {
    ErrorToast("Admin login required");
    return { Rows: [], Total: [{ count: 0 }] };
  }

  try {
    store.dispatch(ShowLoader());

    const URL = `${BaseURL}/admin/users/list/${pageNo}/${perPage}/${searchKeyword || "0"}/${role}`;

    const res = await axios.get(URL, {
      headers: { token }
    });

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
      return res.data.data[0];
    }

    return { Rows: [], Total: [{ count: 0 }] };

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Failed to load users");
    return { Rows: [], Total: [{ count: 0 }] };
  }
}

export async function DeanUsersListRequest(
  pageNo,
  perPage,
  searchKeyword,
  role
) {
  const token = getToken(); // 👈 DEAN TOKEN

  if (!token) {
    ErrorToast("Login required");
    return { Rows: [], Total: [{ count: 0 }] };
  }

  try {
    store.dispatch(ShowLoader());

    const URL = `${BaseURL}/dean/users/list/${pageNo}/${perPage}/${searchKeyword || "0"}/${role}`;

    const res = await axios.get(URL, {
      headers: { token }
    });

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
      return res.data.data[0];
    }

    return { Rows: [], Total: [{ count: 0 }] };

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Failed to load users");
    return { Rows: [], Total: [{ count: 0 }] };
  }
}

export async function DeanChairmanTenureListRequest() {
  try {
    const res = await axios.get(
      `${BaseURL}/dean/tenure/chairman`,
      getAxiosHeader()
    );
    return res.data?.data || [];
  } catch (error) {
    console.error("DeanChairmanTenureListRequest error:", error);
    return [];
  }
}


export async function ChairmanSupervisorsListRequest(searchKeyword = "0") {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.get(
      `${BaseURL}/chairman/users/supervisors/${searchKeyword}`,
      getAxiosHeader()   // ✅ CORRECT
    );

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
      return res.data.data;
    }

    return [];

  } catch (error) {
    store.dispatch(HideLoader());
    ErrorToast("Failed to load supervisors");
    console.error(error.response?.data);
    return [];
  }
}


export async function CreateChairmanDecisionBlueprint(supervisorId) {
  try {
    const res = await axios.post(
      `${BaseURL}/chairman/DecisionBlueprint`,
      { supervisorId },
      getAxiosHeader()
    );

    return res.data;
  } catch (error) {
    return {
      status: "fail",
      data:
        error.response?.data?.data ||
        "Failed to create decision blueprint"
    };
  }
}

export async function ChairmanDecisionBlueprintListRequest() {
  const res = await axios.get(
    `${BaseURL}/chairman/DecisionBlueprint`,
    getAxiosHeader()
  );
  return res.data?.data || [];
}



export async function AdminDeleteUserRequest(userId) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.delete(
      `${BaseURL}/admin/users/delete/${userId}`,
      getAdminAxiosHeader()
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
          ...getAdminAxiosHeader().headers,
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

// ✅ Faculty dropdown (PUBLIC)
export async function FacultyDropdownRequest() {
  try {
    const res = await axios.get(`${BaseURL}/faculty/dropdown`);
    if (res.status === 200 && res.data?.status === "success") {
      return res.data.data || [];
    }
    return [];
  } catch (e) {
    console.error("FacultyDropdownRequest error:", e);
    return [];
  }
}

// ✅ Department dropdown (PUBLIC, faculty optional)
// ================= PUBLIC DEPARTMENT DROPDOWN =================
export async function DepartmentDropdownRequest() {
  try {
    const res = await axios.get(
      `${BaseURL}/DepartmentDropdown`
    );

    if (res.status === 200 && res.data?.status === "success") {
      return res.data.data || [];
    }

    return [];
  } catch (e) {
    console.error("DepartmentDropdownRequest error:", e);
    return [];
  }
}

export const DepartmentSubjectDropdownRequest = async (departmentId) => {
  try {
    const res = await axios.get(
      `${BaseURL}/DepartmentSubjectDropdown/${departmentId}`
    );

    if (res.data?.status === "success") {
      return res.data.data;
    }
    return [];
  } catch {
    return [];
  }
};
/*
/*
⚠️ Backend REQUIRED:
GET /users/supervisors/:departmentId?subject=XYZ
*/
export async function SupervisorDropdownRequest(departmentId, subject = null) {
  if (!departmentId) return [];

  try {
    let url = `${BaseURL}/users/supervisors/${departmentId}`;

    // 🔥 subject-aware
    if (subject) {
      url += `?subject=${encodeURIComponent(subject)}`;
    }

    const res = await axios.get(url);

    if (res.status === 200 && res.data?.status === "success") {
      return res.data.data || [];
    }

    return [];
  } catch (e) {
    console.error("SupervisorDropdownRequest error:", e);
    return [];
  }
}


