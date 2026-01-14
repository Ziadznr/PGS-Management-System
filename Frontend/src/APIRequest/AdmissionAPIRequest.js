import axios from "axios";
import store from "../redux/store/store";
import { ShowLoader, HideLoader } from "../redux/state-slice/settings-slice";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import {
  getToken,
  getAdminToken
} from "../helper/SessionHelper";
import { BaseURL } from "../helper/config";
import { DeleteAlert } from "../helper/DeleteAlert";

// =================================================
// ================= AXIOS HEADERS =================
// =================================================

const userHeader = () => ({
  headers: { token: getToken() }
});

const adminHeader = () => ({
  headers: { token: getAdminToken() }
});

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

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server Error");
    return false;
  }
}

// =================================================
// ================= SUPERVISOR ====================
// =================================================

export async function SupervisorApplications() {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.get(
      `${BaseURL}/admission/supervisor/applications`,
      userHeader()
    );

    store.dispatch(HideLoader());

    return res.data?.status === "success" ? res.data.data : [];

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Failed to load applications");
    return [];
  }
}

export async function SupervisorDecision(applicationId, decision, remarks) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admission/supervisor/decision`,
      { applicationId, decision, remarks },
      userHeader()
    );

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
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

export async function ChairmanApplications() {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.get(
      `${BaseURL}/admission/chairman/applications`,
      userHeader()
    );

    store.dispatch(HideLoader());

    return res.data?.status === "success" ? res.data.data : [];

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Failed to load applications");
    return [];
  }
}

export async function ChairmanDecision(applicationId, decision, remarks) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admission/chairman/decision`,
      { applicationId, decision, remarks },
      userHeader()
    );

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
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

export async function DeanApplications() {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.get(
      `${BaseURL}/admission/dean/applications`,
      userHeader()
    );

    store.dispatch(HideLoader());

    return res.data?.status === "success" ? res.data.data : [];

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Failed to load applications");
    return [];
  }
}

export async function DeanDecision(applicationId, decision, remarks) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admission/dean/decision`,
      { applicationId, decision, remarks },
      userHeader()
    );

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
      SuccessToast("Final Approval Done");
      return res.data.data;
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

// 🔹 Create admission season
export async function CreateAdmissionSeasonRequest(payload) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admission/season/create`,
      payload,
      adminHeader()
    );

    store.dispatch(HideLoader());

    if (
      res.data?.status === "success" ||
      res.data?.success === "success"
    ) {
      SuccessToast("Admission Season Created");
      return res.data.data;
    }

    ErrorToast(res.data?.data || res.data?.message || "Failed to create season");
    return false;

  } catch (e) {
    store.dispatch(HideLoader());
    console.error("CreateAdmissionSeason error:", e);
    ErrorToast("Server Error");
    return false;
  }
}


// 🔹 List seasons
export async function AdmissionSeasonListRequest() {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.get(
      `${BaseURL}/admission/season/list`,
      adminHeader()
    );

    store.dispatch(HideLoader());

    return res.data?.status === "success" ? res.data.data : [];

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Failed to load seasons");
    return [];
  }
}

// 🔹 Department ranges
export async function GetAllDepartmentRangesRequest() {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.get(
      `${BaseURL}/admission/department-range/list`,
      adminHeader()
    );

    store.dispatch(HideLoader());
    return res.data?.status === "success" ? res.data.data : [];

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Failed to load department ranges");
    return [];
  }
}



export async function SetDepartmentRegistrationRangeRequest(payload) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admission/department-range/create-update`,
      payload,
      adminHeader()
    );

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
      SuccessToast("Department Registration Range Saved");
      return true;
    }

    ErrorToast(res.data?.data || "Failed to save range");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server Error");
    return false;
  }
}

export async function ToggleSeasonLockRequest(seasonId) {
  try {
    const res = await axios.post(
      `${BaseURL}/admission/season/lock/${seasonId}`,
      {},
      adminHeader()
    );

    if (res.data?.status === "success") {
      SuccessToast(res.data.data);
      return true;
    }

    ErrorToast("Failed to update lock");
    return false;

  } catch {
    ErrorToast("Server error");
    return false;
  }
}


export async function DeleteDepartmentRangeRequest(id) {
  try {
    const confirm = await DeleteAlert();
    if (!confirm.isConfirmed) return false;

    store.dispatch(ShowLoader());

    const res = await axios.delete(
      `${BaseURL}/admission/department-range/delete/${id}`,
      adminHeader()
    );

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
      SuccessToast("Range deleted");
      return true;
    }

    ErrorToast("Delete failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server error");
    return false;
  }
}
