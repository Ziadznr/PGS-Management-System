// src/APIRequest/DepartmentAPIRequest.js

import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { getAdminToken } from "../helper/SessionHelper";
import {
  SetDepartmentList,
  SetDepartmentListTotal,
  ResetDepartmentFormValue,
  OnChangeDepartmentInput
} from "../redux/state-slice/department-slice";
import { BaseURL } from "../helper/config";

const AxiosHeader = { headers: { token: getAdminToken() } };


// ================= DEPARTMENT LIST =================
export async function DepartmentListRequest(pageNo = 1, perPage = 20, searchKeyword = "0") {
  try {
    store.dispatch(ShowLoader());

    const URL = `${BaseURL}/DepartmentList/${pageNo}/${perPage}/${searchKeyword}`;
    const result = await axios.get(URL, AxiosHeader);

    store.dispatch(HideLoader());

    if (result.status === 200 && result.data?.status === "success") {
      const rows = result.data?.data?.[0]?.Rows || [];
      const total = result.data?.data?.[0]?.Total?.[0]?.count || rows.length;

      store.dispatch(SetDepartmentList(rows));
      store.dispatch(SetDepartmentListTotal(total));

      if (rows.length === 0 && searchKeyword !== "0") {
        ErrorToast("No departments found");
      }
      return true;
    }

    store.dispatch(SetDepartmentList([]));
    store.dispatch(SetDepartmentListTotal(0));
    ErrorToast("Failed to load departments");
    return false;

  } catch (e) {
    console.error("DepartmentListRequest error:", e);
    store.dispatch(HideLoader());
    store.dispatch(SetDepartmentList([]));
    store.dispatch(SetDepartmentListTotal(0));
    ErrorToast("Something went wrong");
    return false;
  }
}


// ================= CREATE / UPDATE DEPARTMENT =================
export async function CreateDepartmentRequest(PostBody, ObjectID = 0) {
  try {
    store.dispatch(ShowLoader());

    const URL =
      ObjectID && ObjectID !== "0"
        ? `${BaseURL}/UpdateDepartment/${ObjectID}`
        : `${BaseURL}/CreateDepartment`;

    const result = await axios.post(URL, PostBody, AxiosHeader);

    store.dispatch(HideLoader());

    if (result.status === 200 && result.data?.status === "success") {
      SuccessToast("Department saved successfully");
      store.dispatch(ResetDepartmentFormValue());
      return true;
    }

    ErrorToast(result.data?.message || "Request failed");
    return false;

  } catch (e) {
    console.error("CreateDepartmentRequest error:", e);
    store.dispatch(HideLoader());
    ErrorToast("Something went wrong");
    return false;
  }
}


// ================= FILL DEPARTMENT FORM =================
export async function FillDepartmentFormRequest(ObjectID) {
  try {
    store.dispatch(ShowLoader());

    const URL = `${BaseURL}/DepartmentDetailsByID/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader);

    store.dispatch(HideLoader());

    if (result.status === 200 && result.data?.status === "success") {
      const data = result.data?.data?.[0];

      store.dispatch(
        OnChangeDepartmentInput({ Name: "Name", Value: data?.name || "" })
      );

      return true;
    }

    ErrorToast("Failed to load department");
    return false;

  } catch (e) {
    console.error("FillDepartmentFormRequest error:", e);
    store.dispatch(HideLoader());
    ErrorToast("Something went wrong");
    return false;
  }
}


// ================= DELETE DEPARTMENT =================
export async function DeleteDepartmentRequest(ObjectID) {
  try {
    store.dispatch(ShowLoader());

    const URL = `${BaseURL}/DeleteDepartment/${ObjectID}`;
    const result = await axios.delete(URL, AxiosHeader);

    store.dispatch(HideLoader());

    if (result.status === 200 && result.data?.status === "success") {
      SuccessToast("Department deleted successfully");
      return true;
    }

    ErrorToast(result.data?.message || "Cannot delete department");
    return false;

  } catch (e) {
    console.error("DeleteDepartmentRequest error:", e);
    store.dispatch(HideLoader());
    ErrorToast("Something went wrong");
    return false;
  }
}
