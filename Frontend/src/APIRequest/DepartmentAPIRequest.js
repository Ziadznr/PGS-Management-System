import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { getToken } from "../helper/SessionHelper";
import {
  SetDepartmentList,
  SetDepartmentListTotal,
  ResetDepartmentFormValue,
  OnChangeDepartmentInput,
} from "../redux/state-slice/department-slice";
import { SetFacultyDropDown } from "../redux/state-slice/faculty-slice";
import { BaseURL } from "../helper/config";

const AxiosHeader = { headers: { token: getToken() } };

// ------------------ Department List ------------------
export async function DepartmentListRequest(pageNo, perPage, searchKeyword) {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/DepartmentList/${pageNo}/${perPage}/${searchKeyword}`;
    const result = await axios.get(URL, AxiosHeader);
    store.dispatch(HideLoader());

    console.log("DepartmentList API result:", result.data);

    if (result.status === 200 && result.data.status === "success") {
      let dataList = [];

      // Nested Rows (old style)
      if (result.data.data?.[0]?.Rows) {
        dataList = result.data.data[0].Rows;
        store.dispatch(SetDepartmentListTotal(result.data.data[0].Total?.[0]?.count || dataList.length));
      } 
      // Flat array (new style)
      else if (Array.isArray(result.data.data)) {
        dataList = result.data.data;
        store.dispatch(SetDepartmentListTotal(result.data.total || dataList.length));
      }

      store.dispatch(SetDepartmentList(dataList));

      if (dataList.length === 0 && searchKeyword !== "0") {
        ErrorToast("No Data Found");
      }
    } else {
      ErrorToast("Something Went Wrong");
      store.dispatch(SetDepartmentList([]));
      store.dispatch(SetDepartmentListTotal(0));
    }
  } catch (e) {
    console.log("DepartmentListRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    store.dispatch(SetDepartmentList([]));
    store.dispatch(SetDepartmentListTotal(0));
  }
}

// ------------------ Create or Update Department ------------------
export async function CreateDepartmentRequest(PostBody, ObjectID) {
  try {
    store.dispatch(ShowLoader());
    let URL = `${BaseURL}/CreateDepartment`;
    if (ObjectID !== 0) URL = `${BaseURL}/UpdateDepartment/${ObjectID}`;

    const result = await axios.post(URL, PostBody, AxiosHeader);
    store.dispatch(HideLoader());

    console.log("CreateDepartmentRequest API response:", result.data);

    if (result.status === 200 && (result.data.status === "success" || result.data.success === "success")) {
      SuccessToast("Request Successful");
      store.dispatch(ResetDepartmentFormValue());
      return true;
    }

    ErrorToast(result.data.message || "Request Fail! Try Again");
    return false;
  } catch (e) {
    console.log("CreateDepartmentRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}

// ------------------ Fill Department Form ------------------
export async function FillDepartmentFormRequest(ObjectID) {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/DepartmentDetailsByID/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader);
    store.dispatch(HideLoader());

    console.log("FillDepartmentFormRequest API response:", result.data);

    if (result.status === 200 && result.data.status === "success") {
      const FormValue = result.data.data?.[0];
      store.dispatch(OnChangeDepartmentInput({ Name: "FacultyID", Value: FormValue?.FacultyID || "" }));
      store.dispatch(OnChangeDepartmentInput({ Name: "Name", Value: FormValue?.Name || "" }));
      return true;
    } else {
      ErrorToast("Request Fail! Try Again");
      return false;
    }
  } catch (e) {
    console.log("FillDepartmentFormRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}

// ------------------ Faculty DropDown ------------------
export async function FacultyDropDownRequest() {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/FacultyDropdown`;
    const result = await axios.get(URL, AxiosHeader);
    store.dispatch(HideLoader());

    console.log("FacultyDropDownRequest API response:", result.data);

    if (result.status === 200 && result.data.status === "success") {
      store.dispatch(SetFacultyDropDown(result.data.data || []));
      if (!result.data.data?.length) ErrorToast("No Faculty Found");
    } else {
      ErrorToast("Something Went Wrong");
    }
  } catch (e) {
    console.log("FacultyDropDownRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
  }
}

// ------------------ Delete Department ------------------
export async function DeleteDepartmentRequest(ObjectID) {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/DeleteDepartment/${ObjectID}`;
    const result = await axios.delete(URL, AxiosHeader);
    store.dispatch(HideLoader());

    console.log("DeleteDepartmentRequest API response:", result.data);

    if (result.status === 200 && result.data.status === "fail") {
      ErrorToast(result.data.message || "This Department is associated, cannot delete");
      return false;
    } else if (result.status === 200 && result.data.status === "success") {
      SuccessToast("Request Successful");
      return true;
    } else {
      ErrorToast("Request Fail! Try Again");
      return false;
    }
  } catch (e) {
    console.log("DeleteDepartmentRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}
