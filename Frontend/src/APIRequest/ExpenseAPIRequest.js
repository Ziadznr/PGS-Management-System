import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { getToken } from "../helper/SessionHelper";
import {
  OnChangeExpenseInput,
  ResetExpenseFormValue,
  SetExpenseList,
  SetExpenseListTotal,
  SetExpenseTypeDropDown,
} from "../redux/state-slice/expense-slice";
import { BaseURL } from "../helper/config";

const AxiosHeader = { headers: { token: getToken() } };

// ------------------ Expense List ------------------
export async function ExpenseListRequest(pageNo, perPage, searchKeyword) {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/ExpensesList/${pageNo}/${perPage}/${searchKeyword}`;
    const result = await axios.get(URL, AxiosHeader);

    console.log("ExpenseListRequest API result:", result.data);

    if (result.status === 200 && (result.data.status === "success" || result.data.success === "success")) {
      const data = result.data.data?.[0];
      if (data?.Rows?.length > 0) {
        store.dispatch(SetExpenseList(data.Rows));
        store.dispatch(SetExpenseListTotal(data.Total?.[0]?.count || 0));
      } else {
        store.dispatch(SetExpenseList([]));
        store.dispatch(SetExpenseListTotal(0));
        // Optional: ErrorToast("No Data Found");
      }
    } else {
      store.dispatch(SetExpenseList([]));
      store.dispatch(SetExpenseListTotal(0));
      ErrorToast("Something Went Wrong");
    }
  } catch (e) {
    console.error("ExpenseListRequest error:", e);
    store.dispatch(SetExpenseList([]));
    store.dispatch(SetExpenseListTotal(0));
    ErrorToast("Something Went Wrong");
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Expense Type DropDown ------------------
export async function ExpenseTypeDropDownRequest() {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/ExpenseTypesDropDown`;
    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && (result.data.status === "success" || result.data.success === "success")) {
      const data = result.data.data || [];
      store.dispatch(SetExpenseTypeDropDown(data));
    } else {
      store.dispatch(SetExpenseTypeDropDown([]));
      ErrorToast("Something Went Wrong");
    }
  } catch (e) {
    console.error("ExpenseTypeDropDownRequest error:", e);
    store.dispatch(SetExpenseTypeDropDown([]));
    ErrorToast("Something Went Wrong");
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Create or Update Expense ------------------
export async function CreateExpenseRequest(PostBody, ObjectID) {
  try {
    store.dispatch(ShowLoader());
    let URL = `${BaseURL}/CreateExpense`;
    if (ObjectID && ObjectID !== 0) {
      URL = `${BaseURL}/UpdateExpense/${ObjectID}`;
    }

    const result = await axios.post(URL, PostBody, AxiosHeader);

    console.log("CreateExpenseRequest API response:", result.data);

    if (result.status === 200 && (result.data.status === "success" || result.data.success === "success")) {
      SuccessToast("Request Successful");
      store.dispatch(ResetExpenseFormValue());
      return true;
    }

    if (result.status === 200 && result.data.status === "fail") {
      ErrorToast(result.data?.message || "Request Failed! Try Again");
      return false;
    }

    ErrorToast("Request Failed! Try Again");
    return false;
  } catch (e) {
    console.error("CreateExpenseRequest error:", e);
    ErrorToast("Something Went Wrong");
    return false;
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Fill Expense Form ------------------
export async function FillExpenseFormRequest(ObjectID) {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/ExpenseDetailsByID/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader);

    console.log("FillExpenseFormRequest API response:", result.data);

    if (result.status === 200 && (result.data.status === "success" || result.data.success === "success")) {
      const FormValue = result.data.data?.[0];
      store.dispatch(OnChangeExpenseInput({ Name: "TypeID", Value: FormValue?.TypeID || "" }));
      store.dispatch(OnChangeExpenseInput({ Name: "Amount", Value: FormValue?.Amount || "" }));
      store.dispatch(OnChangeExpenseInput({ Name: "Note", Value: FormValue?.Note || "" }));
      return true;
    } else {
      ErrorToast("Request Failed! Try Again");
      return false;
    }
  } catch (e) {
    console.error("FillExpenseFormRequest error:", e);
    ErrorToast("Something Went Wrong");
    return false;
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Delete Expense ------------------
export async function DeleteExpenseRequest(ObjectID) {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/DeleteExpense/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader); // You may switch to axios.delete later

    console.log("DeleteExpenseRequest API response:", result.data);

    if (result.status === 200 && (result.data.status === "success" || result.data.success === "success")) {
      SuccessToast("Request Successful");
      return true;
    } else {
      ErrorToast("Request Failed! Try Again");
      return false;
    }
  } catch (e) {
    console.error("DeleteExpenseRequest error:", e);
    ErrorToast("Something Went Wrong");
    return false;
  } finally {
    store.dispatch(HideLoader());
  }
}
