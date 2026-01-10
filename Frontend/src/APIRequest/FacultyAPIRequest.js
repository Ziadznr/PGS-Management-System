// src/APIRequest/FacultyAPIRequest.js
import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { getToken } from "../helper/SessionHelper";
import {
  SetFacultyList,
  SetFacultyListTotal,
  ResetFacultyFormValue,
  OnChangeFacultyInput
} from "../redux/state-slice/faculty-slice";
import { BaseURL } from "../helper/config";

const AxiosHeader = { headers: { token: getToken() } };

// ------------------ Faculty List ------------------
export async function FacultyListRequest(pageNo, perPage, searchKeyword) {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/FacultyList/${pageNo}/${perPage}/${searchKeyword}`;
    const result = await axios.get(URL, AxiosHeader);
    store.dispatch(HideLoader());

    console.log("FacultyListRequest response:", result.data);

    if (result.status === 200 && result.data?.success === "success") {
      const rows = result.data?.data[0]?.Rows || [];
      const total = result.data?.data[0]?.Total[0]?.count || 0;

      store.dispatch(SetFacultyList(rows));
      store.dispatch(SetFacultyListTotal(total));

    } else {
      store.dispatch(SetFacultyList([]));
      store.dispatch(SetFacultyListTotal(0));
      ErrorToast("Something Went Wrong");
    }
  } catch (e) {
    console.log("FacultyListRequest error:", e);
    store.dispatch(HideLoader());
    store.dispatch(SetFacultyList([]));
    store.dispatch(SetFacultyListTotal(0));
    ErrorToast("Something Went Wrong");
  }
}

// ------------------ Create or Update Faculty ------------------
export async function CreateFacultyRequest(PostBody, ObjectID) {
  try {
    store.dispatch(ShowLoader());
    let URL = `${BaseURL}/CreateFaculty`;
    if (ObjectID !== 0) {
      URL = `${BaseURL}/UpdateFaculty/${ObjectID}`;
    }

    const result = await axios.post(URL, PostBody, AxiosHeader);
    store.dispatch(HideLoader());

    console.log("CreateFacultyRequest response:", result.data);

    if (result.status === 200 && result.data?.success === "success") {
      SuccessToast("Request Successful");
      store.dispatch(ResetFacultyFormValue());
      return true;
    } 
    else if (result.status === 200 && result.data?.success === "fail") {
      if (result.data?.data?.keyPattern?.Name === 1) {
        ErrorToast("Faculty Name Already Exist");
        return false;
      } else {
        ErrorToast(result.data?.message || "Request Failed");
        return false;
      }
    } 
    else {
      ErrorToast("Request Fail! Try Again");
      return false;
    }
  } catch (e) {
    console.log("CreateFacultyRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}

// ------------------ Fill Faculty Form ------------------
export async function FillFacultyFormRequest(ObjectID) {
  store.dispatch(ShowLoader());
  try {
    const URL = `${BaseURL}/FacultyDetailsByID/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && result.data?.success === "success") {
      const FormValue = result.data?.data?.[0];
      store.dispatch(OnChangeFacultyInput({ Name: "Name", Value: FormValue?.Name || "" }));
      return true;
    } else {
      ErrorToast("Request Failed! Try Again");
      return false;
    }
  } catch (e) {
    console.log("FillFacultyFormRequest error:", e);
    ErrorToast("Something Went Wrong");
    return false;
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Delete Faculty ------------------
export async function DeleteFacultyRequest(ObjectID) {
  store.dispatch(ShowLoader());
  try {
    const URL = `${BaseURL}/DeleteFaculty/${ObjectID}`;
    const result = await axios.delete(URL, AxiosHeader);

    if (result.status === 200 && result.data?.status === "fail") {
      ErrorToast(result.data?.message || "Cannot delete associated faculty");
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
    console.log("DeleteFacultyRequest error:", e);
    ErrorToast("Something Went Wrong");
    return false;
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Faculty Dropdown ------------------
export async function FacultyDropdownRequest() {
  store.dispatch(ShowLoader());
  try {
    const URL = `${BaseURL}/FacultyDropdown`;
    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && result.data?.status === "success") {
      return result.data?.data || [];
    } else {
      ErrorToast("Failed to load Faculty Dropdown");
      return [];
    }
  } catch (e) {
    console.log("FacultyDropdownRequest error:", e);
    ErrorToast("Something Went Wrong");
    return [];
  } finally {
    store.dispatch(HideLoader());
  }
}
