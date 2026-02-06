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

/* =================================================
   AXIOS HEADERS
================================================= */

const userHeader = () => {
  const token = getToken();
  if (!token) throw new Error("User token missing");
  return { headers: { token } };
};


const adminHeader = () => ({
  headers: { token: getAdminToken() }
});

/* =================================================
   STUDENT (PUBLIC)
================================================= */

// 🔹 Apply for admission
export async function ApplyForAdmissionRequest(payload) {
  try {
    store.dispatch(ShowLoader());
    const res = await axios.post(`${BaseURL}/admission/apply`, payload);
    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
      // SuccessToast is already here, no need to add it to the page
      return res.data; // Return the whole res.data so the page can see .status
    }

    // This catches the "Already applied" or "Payment failed" messages from your backend service
    ErrorToast(res.data?.data || "Application failed");
    return res.data; 

  } catch (e) {
    store.dispatch(HideLoader());
    // Catch actual server crashes
    const errorMsg = e.response?.data?.data || "Server error";
    ErrorToast(errorMsg);
    return { status: "fail", data: errorMsg };
  }
}

/* =================================================
   SUPERVISOR
================================================= */

export async function SupervisorApplications() {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.get(
      `${BaseURL}/admission/supervisor/applications`,
      userHeader()
    );

    store.dispatch(HideLoader());
    return res.data; // 🔥 RETURN FULL RESPONSE

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Failed to load supervisor applications");
    return { status: "fail", data: [] };
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
      SuccessToast("Decision submitted");
      return true;
    }

    ErrorToast(res.data?.data || "Action failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server error");
    return false;
  }
}

/* =================================================
   CHAIRMAN
================================================= */

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
    ErrorToast("Failed to load chairman applications");
    return [];
  }
}

export async function ChairmanDecision() {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admission/chairman/decision`,
      {},
      userHeader()
    );

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
      SuccessToast("Chairman ranking completed");
      return true;
    }

    ErrorToast(res.data?.data || "Action failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server error");
    return false;
  }
}

export async function ChairmanManualSelect(applicationId) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admission/chairman/manual-select`,
      { applicationId },
      userHeader()
    );

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
      SuccessToast("Applicant selected successfully");
      return true;
    }

    ErrorToast(res.data?.data || "Action failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server error");
    return false;
  }
}


/* =================================================
   DEAN
================================================= */

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
    ErrorToast("Failed to load dean applications");
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
      SuccessToast("Dean decision completed");
      return res.data.data; // contains temp login if approved
    }

    ErrorToast(res.data?.data || "Action failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server error");
    return false;
  }
}

/* =================================================
   TEMP LOGIN (NO TOKEN)
================================================= */

export async function TemporaryLoginRequest(tempLoginId, password) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admission/temporary-login`,
      { tempLoginId, password }
    );

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
      SuccessToast("Temporary login successful");
      return res.data.data;
    }

    ErrorToast(res.data?.data || "Temporary login failed");
    return false;

  } catch (e) {
    store.dispatch(HideLoader());

    // 🔥 THIS IS THE KEY FIX
    const errorMsg =
      e.response?.data?.data ||   // backend message (400)
      e.message ||                // axios error
      "Server error";

    ErrorToast(errorMsg);
    return false;
  }
}

/* =================================================
   FINAL ENROLLMENT
================================================= */

export async function FinalizeEnrollmentRequest(applicationId, password) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/admission/finalize-enrollment`,
      { applicationId, password },
      adminHeader()
    );

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
      SuccessToast("Enrollment completed");
      return res.data.data;
    }

    ErrorToast(res.data?.data || "Enrollment failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server error");
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

export async function PublicAdmissionSeasonListRequest() {
  try {
    const res = await axios.get(
      `${BaseURL}/admission/season/public`
    );

    return res.data?.status === "success"
      ? res.data.data
      : [];

  } catch (e) {
    console.error("PublicAdmissionSeasonList error:", e);
    return [];
  }
}

export async function SetDepartmentLastSemesterCoursesRequest(courses) {
  try {
    const res = await axios.post(
      `${BaseURL}/admission/department-last-semester-courses`,
      { courses },
      userHeader() // chairman token
    );

    if (res.data?.status === "success") {
      SuccessToast("Courses saved successfully");
      return true;
    }

    ErrorToast(res.data?.data || "Failed to save courses");
    return false;

  } catch (e) {
    console.error(e);
    ErrorToast("Server error");
    return false;
  }
}


// Load existing courses (for list / edit)
export async function GetChairmanDepartmentLastSemesterCoursesRequest() {
  try {
    const res = await axios.get(
      `${BaseURL}/admission/department-last-semester-courses/chairman`,
      userHeader()
    );

    return res.data?.status === "success"
      ? res.data.data
      : null;

  } catch (e) {
    console.error(e);
    return null;
  }
}


export async function GetDepartmentLastSemesterCoursesRequest(departmentId) {
  try {
    const res = await axios.get(
      `${BaseURL}/admission/department-last-semester-courses/${departmentId}`
    );

    return res.data?.status === "success"
      ? res.data.data
      : [];

  } catch (e) {
    console.error(e);
    return [];
  }
}



