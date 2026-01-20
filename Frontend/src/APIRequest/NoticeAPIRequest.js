import axios from "axios";
import store from "../redux/store/store";
import { ShowLoader, HideLoader } from "../redux/state-slice/settings-slice";
import { SuccessToast, ErrorToast } from "../helper/FormHelper";
import { BaseURL } from "../helper/config";
import { getAdminToken } from "../helper/SessionHelper";
import { DeleteAlert } from "../helper/DeleteAlert";

// =================================================
// AXIOS ADMIN HEADER
// =================================================
const adminHeader = () => ({
  headers: {
    token: getAdminToken()
  }
});

// =================================================
// CREATE NOTICE (ADMIN)
// =================================================
export async function CreateNoticeRequest(payload) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/notice/create`,
      payload,
      adminHeader()
    );

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
      SuccessToast("Notice created successfully");
      return true;
    }

    ErrorToast(res.data?.data || "Failed to create notice");
    return false;

  } catch (e) {
    store.dispatch(HideLoader());
    ErrorToast("Server error");
    return false;
  }
}

// =================================================
// UPDATE NOTICE (ADMIN)
// =================================================
export async function UpdateNoticeRequest(id, payload) {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.post(
      `${BaseURL}/notice/update/${id}`,
      payload,
      adminHeader()
    );

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
      SuccessToast("Notice updated");
      return true;
    }

    ErrorToast(res.data?.data || "Update failed");
    return false;

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Server error");
    return false;
  }
}

// =================================================
// DELETE NOTICE (ADMIN)
// =================================================
export async function DeleteNoticeRequest(id) {
  const confirm = await DeleteAlert();
  if (!confirm.isConfirmed) return false;

  try {
    store.dispatch(ShowLoader());

    const res = await axios.delete(
      `${BaseURL}/notice/delete/${id}`,
      adminHeader()
    );

    store.dispatch(HideLoader());

    if (res.data?.status === "success") {
      SuccessToast("Notice deleted");
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

// =================================================
// PIN / UNPIN NOTICE (ADMIN)
// =================================================
export async function ToggleNoticePinRequest(id) {
  try {
    const res = await axios.post(
      `${BaseURL}/notice/pin/${id}`,
      {},
      adminHeader()
    );

    if (res.data?.status === "success") {
      SuccessToast(res.data.data);
      return true;
    }

    ErrorToast("Action failed");
    return false;

  } catch {
    ErrorToast("Server error");
    return false;
  }
}

// =================================================
// LOCK / UNLOCK NOTICE (ADMIN)
// =================================================
export async function ToggleNoticeLockRequest(id) {
  try {
    const res = await axios.post(
      `${BaseURL}/notice/lock/${id}`,
      {},
      adminHeader()
    );

    if (res.data?.status === "success") {
      SuccessToast(res.data.data);
      return true;
    }

    ErrorToast("Action failed");
    return false;

  } catch {
    ErrorToast("Server error");
    return false;
  }
}

// =================================================
// ADMIN NOTICE LIST
// =================================================
export async function GetAdminNoticeListRequest() {
  try {
    store.dispatch(ShowLoader());

    const res = await axios.get(
      `${BaseURL}/notice/admin/list`,
      adminHeader()
    );

    store.dispatch(HideLoader());

    return res.data?.status === "success" ? res.data.data : [];

  } catch {
    store.dispatch(HideLoader());
    ErrorToast("Failed to load notices");
    return [];
  }
}

// =================================================
// PUBLIC NOTICE LIST (LANDING PAGE)
// =================================================

// 🔄 Latest notice (slider)
export async function GetLatestNoticeRequest() {
  try {
    const res = await axios.get(`${BaseURL}/notice/public/latest`);
    return res.data?.status === "success" ? res.data.data : null;
  } catch {
    return null;
  }
}

// 📂 All public notices
export async function GetPublicNoticesRequest() {
  try {
    const res = await axios.get(`${BaseURL}/notice/public/list`);
    return res.data?.status === "success" ? res.data.data : [];
  } catch {
    return [];
  }
}


