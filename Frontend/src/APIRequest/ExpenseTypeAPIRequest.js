import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { getToken } from "../helper/SessionHelper";
import {
  OnChangeExpenseTypeInput,
  ResetExpenseTypeFormValue,
  SetExpenseTypeList,
  SetExpenseTypeListTotal,
} from "../redux/state-slice/expensetype-slice";
import { BaseURL } from "../helper/config";

const AxiosHeader = { headers: { token: getToken() } };

// ------------------ Expense Type List ------------------
export async function ExpenseTypeListRequest(pageNo, perPage, searchKeyword) {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/ExpenseTypesList/${pageNo}/${perPage}/${searchKeyword}`;
    const result = await axios.get(URL, AxiosHeader);
    store.dispatch(HideLoader());

    if (result.status === 200 && result.data?.success === "success") {
      const rows = result.data?.data?.[0]?.Rows || [];
      const total = result.data?.data?.[0]?.Total?.[0]?.count || 0;

      store.dispatch(SetExpenseTypeList(rows));
      store.dispatch(SetExpenseTypeListTotal(total));

      if (rows.length === 0) {
        // Optional: ErrorToast("No Data Found");
      }
    } else {
      store.dispatch(SetExpenseTypeList([]));
      store.dispatch(SetExpenseTypeListTotal(0));
      ErrorToast("Something Went Wrong");
    }
  } catch (e) {
    console.error("ExpenseTypeListRequest error:", e);
    store.dispatch(HideLoader());
    store.dispatch(SetExpenseTypeList([]));
    store.dispatch(SetExpenseTypeListTotal(0));
    ErrorToast("Something Went Wrong");
  }
}

// ------------------ Create or Update Expense Type ------------------
export async function CreateExpenseTypeRequest(PostBody, ObjectID) {
  try {
    store.dispatch(ShowLoader());
    let URL = `${BaseURL}/CreateExpenseTypes`;
    if (ObjectID !== 0) {
      URL = `${BaseURL}/UpdateExpenseTypes/${ObjectID}`;
    }

    const result = await axios.post(URL, PostBody, AxiosHeader);
    store.dispatch(HideLoader());

    if (result.status === 200 && result.data?.success === "success") {
      SuccessToast("Request Successful");
      store.dispatch(ResetExpenseTypeFormValue());
      return true;
    } 
    else if (result.status === 200 && result.data?.success === "fail") {
      if (result.data?.data?.keyPattern?.Name === 1) {
        ErrorToast("Expense Type Name Already Exists");
        return false;
      } else {
        ErrorToast(result.data?.message || "Request Failed");
        return false;
      }
    } 
    else {
      ErrorToast("Request Failed! Try Again");
      return false;
    }
  } catch (e) {
    console.error("CreateExpenseTypeRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}

// ------------------ Fill Expense Type Form ------------------
export async function FillExpenseTypeFormRequest(ObjectID) {
  store.dispatch(ShowLoader());
  try {
    const URL = `${BaseURL}/ExpenseTypesDetailsByID/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && result.data?.success === "success") {
      const FormValue = result.data?.data?.[0];
      store.dispatch(OnChangeExpenseTypeInput({ Name: "Name", Value: FormValue?.Name || "" }));
      return true;
    } else {
      ErrorToast("Request Failed! Try Again");
      return false;
    }
  } catch (e) {
    console.error("FillExpenseTypeFormRequest error:", e);
    ErrorToast("Something Went Wrong");
    return false;
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Delete Expense Type ------------------
export async function DeleteExpenseTypeRequest(ObjectID) {
  store.dispatch(ShowLoader());
  try {
    const URL = `${BaseURL}/DeleteExpenseTypes/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader); // Consider changing to axios.delete

    if (result.status === 200 && result.data?.status === "associate") {
      ErrorToast(result.data?.data || "Cannot delete associated expense type");
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
    console.error("DeleteExpenseTypeRequest error:", e);
    ErrorToast("Something Went Wrong");
    return false;
  } finally {
    store.dispatch(HideLoader());
  }
}
