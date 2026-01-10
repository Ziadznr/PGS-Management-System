import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import { BaseURL } from "../helper/config";
import axios from "axios";

import { ErrorToast } from "../helper/FormHelper";
import { getToken } from "../helper/SessionHelper";

import {
  SetExpensesByDateList,
  SetPurchaseByDateList,
  SetReturnByDateList,
  SetSalesByDateList,
  SetCustomerProductReportList,   // 🔹 added this
} from "../redux/state-slice/report-slice";

const AxiosHeader = { headers: { token: getToken() } };

// Common date range builder
const buildDateRange = (FromDate, ToDate) => ({
  FromDate: FromDate + "T00:00:00.000Z",
  ToDate: ToDate + "T23:59:59.999Z",
});

// 🔹 Expenses Report
export async function ExpensesByDateRequest(FromDate, ToDate) {
  try {
    store.dispatch(ShowLoader());
    let PostBody = buildDateRange(FromDate, ToDate);

    let URL = BaseURL + "/ExpensesByDate";
    const result = await axios.post(URL, PostBody, AxiosHeader);

    store.dispatch(HideLoader());
    if (result.status === 200 && result.data.status === "success") {
      store.dispatch(SetExpensesByDateList(result.data.data));
    } else {
      ErrorToast(result.data?.message || "Something Went Wrong");
    }
  } catch (e) {
    console.error("ExpensesByDateRequest Error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
  }
}

// 🔹 Sales Report
export async function SalesByDateRequest(FromDate, ToDate) {
  try {
    store.dispatch(ShowLoader());
    let PostBody = buildDateRange(FromDate, ToDate);

    let URL = BaseURL + "/SalesByDate";
    const result = await axios.post(URL, PostBody, AxiosHeader);

    store.dispatch(HideLoader());
    if (result.status === 200 && result.data.status === "success") {
      store.dispatch(SetSalesByDateList(result.data.data));
    } else {
      ErrorToast(result.data?.message || "Something Went Wrong");
    }
  } catch (e) {
    console.error("SalesByDateRequest Error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
  }
}

// 🔹 Purchases Report
export async function PurchaseByDateRequest(FromDate, ToDate) {
  try {
    store.dispatch(ShowLoader());
    let PostBody = buildDateRange(FromDate, ToDate);

    let URL = BaseURL + "/PurchasesByDate";
    const result = await axios.post(URL, PostBody, AxiosHeader);

    store.dispatch(HideLoader());
    if (result.status === 200 && result.data.status === "success") {
      store.dispatch(SetPurchaseByDateList(result.data.data));
    } else {
      ErrorToast(result.data?.message || "Something Went Wrong");
    }
  } catch (e) {
    console.error("PurchaseByDateRequest Error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
  }
}

// 🔹 Returns Report
export async function ReturnByDateRequest(FromDate, ToDate) {
  try {
    store.dispatch(ShowLoader());
    let PostBody = buildDateRange(FromDate, ToDate);

    let URL = BaseURL + "/ReturnByDate";
    const result = await axios.post(URL, PostBody, AxiosHeader);

    store.dispatch(HideLoader());
    if (result.status === 200 && result.data.status === "success") {
      store.dispatch(SetReturnByDateList(result.data.data));
    } else {
      ErrorToast(result.data?.message || "Something Went Wrong");
    }
  } catch (e) {
    console.error("ReturnByDateRequest Error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
  }
}

// 🔹 Customer Product Report
export async function CustomerProductReportRequest({
  CustomerID = null,
  FacultyID = null,
  DepartmentID = null,
  SectionID = null,
  FromDate,
  ToDate
}) {
  try {
    store.dispatch(ShowLoader());

    // Validate FromDate and ToDate
    if (!FromDate || !ToDate) {
      ErrorToast("FromDate and ToDate are required");
      store.dispatch(HideLoader());
      return;
    }

    // Convert to ISO format (MongoDB friendly)
    const fromISO = new Date(FromDate);
    const toISO = new Date(ToDate);

    if (isNaN(fromISO) || isNaN(toISO)) {
      ErrorToast("Invalid date format");
      store.dispatch(HideLoader());
      return;
    }

    const PostBody = {
      CustomerID,
      FacultyID,
      DepartmentID,
      SectionID,
      FromDate: fromISO.toISOString(),
      ToDate: toISO.toISOString(),
    };

    const URL = BaseURL + "/CustomerProductReport";
    const result = await axios.post(URL, PostBody, AxiosHeader);

    store.dispatch(HideLoader());

    if (result.status === 200 && result.data.status === "success") {
      store.dispatch(SetCustomerProductReportList(result.data.data));
    } else {
      ErrorToast(result.data?.message || "Something Went Wrong");
    }
  } catch (e) {
    console.error("CustomerProductReportRequest Error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
  }
}
