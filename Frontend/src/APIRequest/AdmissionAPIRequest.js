import axios from "axios";
import store from "../redux/store/store";
import { ShowLoader, HideLoader } from "../redux/state-slice/settings-slice";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { getUserToken } from "../helper/SessionHelper";
import { BaseURL } from "../helper/config";

// ================= AXIOS HEADER =================
const getAxiosHeader = () => {
  const token = getUserToken();
  return { headers: { token } };
};

// =================================================
// ================= STUDENT =======================
// =================================================

// 🔹 Student applies for admission (PUBLIC)
export async function ApplyForAdmissionRequest(formData) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admission/apply`,
      formData
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      SuccessToast("Application Submitted Successfully");
      return true;
    }

    ErrorToast(res.data?.data || "Application Failed");
    return false;

  } catch (e) {
    store.dispatch(HideLoader());
    ErrorToast("Server Error");
    return false;
  }
}

// 🔹 Student checks application status
export async function StudentApplicationStatus() {
  try {
    const res = await axios.get(
      `${BaseURL}/admission/my-status`,
      getAxiosHeader()
    );

    if (res.status === 200 && res.data?.status === "success") {
      return res.data.data;
    }

    return null;

  } catch {
    ErrorToast("Failed to load status");
    return null;
  }
}

// =================================================
// ================= SUPERVISOR ====================
// =================================================

// 🔹 Supervisor sees applications
export async function SupervisorApplications() {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.get(
      `${BaseURL}/admission/supervisor/applications`,
      getAxiosHeader()
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      return res.data.data;
    }

    return [];

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Failed to load applications");
    return [];
  }
}

// 🔹 Supervisor approve / reject
export async function SupervisorDecision(applicationId, decision, remarks) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admission/supervisor/decision`,
      { applicationId, decision, remarks },
      getAxiosHeader()
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      SuccessToast("Decision Submitted");
      return true;
    }

    ErrorToast("Action failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server Error");
    return false;
  }
}

// =================================================
// ================= CHAIRMAN ======================
// =================================================

// 🔹 Chairman sees applications
export async function ChairmanApplications() {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.get(
      `${BaseURL}/admission/chairman/applications`,
      getAxiosHeader()
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      return res.data.data;
    }

    return [];

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Failed to load applications");
    return [];
  }
}

// 🔹 Chairman decision
export async function ChairmanDecision(applicationId, decision, remarks) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admission/chairman/decision`,
      { applicationId, decision, remarks },
      getAxiosHeader()
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      SuccessToast("Decision Submitted");
      return true;
    }

    ErrorToast("Action failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server Error");
    return false;
  }
}

// =================================================
// ================= DEAN ==========================
// =================================================

// 🔹 Dean sees applications
export async function DeanApplications() {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.get(
      `${BaseURL}/admission/dean/applications`,
      getAxiosHeader()
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      return res.data.data;
    }

    return [];

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Failed to load applications");
    return [];
  }
}

// 🔹 Dean final decision
export async function DeanDecision(applicationId, decision, remarks) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admission/dean/decision`,
      { applicationId, decision, remarks },
      getAxiosHeader()
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      SuccessToast("Final Approval Done");
      return true;
    }

    ErrorToast("Action failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server Error");
    return false;
  }
}

// =================================================
// ================= ADMIN =========================
// =================================================

// 🔹 Admin creates admission season
export async function CreateAdmissionSeasonRequest(payload) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admission/season/create`,
      payload,
      getAxiosHeader()
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      SuccessToast("Admission Season Created");
      return true;
    }

    ErrorToast("Failed to create season");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server Error");
    return false;
  }
}

// 🔹 Admin sets faculty registration range
export async function SetFacultyRegistrationRangeRequest(payload) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admission/faculty-range/create`,
      payload,
      getAxiosHeader()
    );

    store.dispatch(HideLoader());

    if (res.status === 200 && res.data?.status === "success") {
      SuccessToast("Registration Range Set");
      return true;
    }

    ErrorToast("Failed to set range");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server Error");
    return false;
  }
}
