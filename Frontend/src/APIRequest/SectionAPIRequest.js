// src/APIRequest/SectionAPIRequest.js
import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { getToken } from "../helper/SessionHelper";
import {
  SetSectionList,
  SetSectionListTotal,
  ResetSectionFormValue,
  OnChangeSectionInput,
  SetSectionDropDown
} from "../redux/state-slice/section-slice";
import { BaseURL } from "../helper/config";

const AxiosHeader = { headers: { token: getToken() } };

// ------------------ Section List ------------------
export async function SectionListRequest(pageNo, perPage, searchKeyword) {
  store.dispatch(ShowLoader());
  try {
    const URL = `${BaseURL}/SectionList/${pageNo}/${perPage}/${searchKeyword}`;
    const result = await axios.get(URL, AxiosHeader);

    console.log("SectionListRequest response:", result.data);

    if (result.status === 200 && result.data?.success === "success") {
      const rows = result.data?.data[0]?.Rows || [];
      const total = result.data?.data[0]?.Total[0]?.count || 0;

      store.dispatch(SetSectionList(rows));
      store.dispatch(SetSectionListTotal(total));

    } else {
      store.dispatch(SetSectionList([]));
      store.dispatch(SetSectionListTotal(0));
      ErrorToast("Something Went Wrong");
    }

  } catch (e) {
    console.log("SectionListRequest error:", e);
    store.dispatch(SetSectionList([]));
    store.dispatch(SetSectionListTotal(0));
    ErrorToast("Something Went Wrong");
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Create or Update Section ------------------
export async function CreateSectionRequest(PostBody, ObjectID) {
  store.dispatch(ShowLoader());
  try {
    let URL = `${BaseURL}/CreateSection`;
    if (ObjectID !== 0) URL = `${BaseURL}/UpdateSection/${ObjectID}`;

    const result = await axios.post(URL, PostBody, AxiosHeader);

    console.log("CreateSectionRequest response:", result.data);

    if (result.status === 200 && result.data?.success === "success") {
      SuccessToast("Request Successful");
      store.dispatch(ResetSectionFormValue());
      return true;
    } else if (result.status === 200 && result.data?.success === "fail") {
      if (result.data?.data?.keyPattern?.Name === 1) {
        ErrorToast("Section Name Already Exists");
      } else {
        ErrorToast(result.data?.message || "Request Failed");
      }
      return false;
    } else {
      ErrorToast("Request Failed! Try Again");
      return false;
    }

  } catch (e) {
    console.log("CreateSectionRequest error:", e);
    ErrorToast("Something Went Wrong");
    return false;
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Fill Section Form ------------------
export async function FillSectionFormRequest(ObjectID) {
  store.dispatch(ShowLoader());
  try {
    const URL = `${BaseURL}/SectionDetailsByID/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && result.data?.success === "success") {
      const FormValue = result.data?.data?.[0];
      store.dispatch(OnChangeSectionInput({ Name: "Name", Value: FormValue?.Name || "" }));
      return true;
    } else {
      ErrorToast("Request Failed! Try Again");
      return false;
    }

  } catch (e) {
    console.log("FillSectionFormRequest error:", e);
    ErrorToast("Something Went Wrong");
    return false;
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Delete Section ------------------
export async function DeleteSectionRequest(ObjectID) {
  store.dispatch(ShowLoader());
  try {
    const URL = `${BaseURL}/DeleteSection/${ObjectID}`;
    const result = await axios.delete(URL, AxiosHeader);

    if (result.status === 200 && result.data?.status === "fail") {
      ErrorToast(result.data?.message || "Cannot delete associated Section");
      return false;
    }

    if (result.status === 200 && result.data?.status === "success") {
      SuccessToast("Request Successful");
      return true;
    } else {
      ErrorToast("Request Failed! Try Again");
      return false;
    }

  } catch (e) {
    console.log("DeleteSectionRequest error:", e);
    ErrorToast("Something Went Wrong");
    return false;
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Section Dropdown ------------------
export async function SectionDropdownRequest() {
  store.dispatch(ShowLoader());
  try {
    const URL = `${BaseURL}/SectionDropdown`;
    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && result.data?.status === "success") {
      store.dispatch(SetSectionDropDown(result.data?.data || []));
      return result.data?.data || [];
    } else {
      ErrorToast("Failed to load Section Dropdown");
      return [];
    }

  } catch (e) {
    console.log("SectionDropdownRequest error:", e);
    ErrorToast("Something Went Wrong");
    return [];
  } finally {
    store.dispatch(HideLoader());
  }
}
