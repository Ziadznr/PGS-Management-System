import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { getToken } from "../helper/SessionHelper";
import {
  SetSupplierList,
  SetSupplierListTotal,
  OnChangeSupplierInput,
  ResetSupplierFormValue,
} from "../redux/state-slice/supplier-slice";
import { BaseURL } from "../helper/config";

const AxiosHeader = { headers: { token: getToken() } };

// ------------------ Supplier List ------------------
export async function SupplierListRequest(pageNo, perPage, searchKeyword) {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/SuppliersList/${pageNo}/${perPage}/${searchKeyword}`;
    const result = await axios.get(URL, AxiosHeader);
    store.dispatch(HideLoader());

    console.log("SupplierListRequest response:", result.data); // debug

    if (result.status === 200 && result.data?.success === "success") {
      const rows = result.data?.data[0]?.Rows || [];
      const total = result.data?.data[0]?.Total[0]?.count || 0;

      store.dispatch(SetSupplierList(rows));
      store.dispatch(SetSupplierListTotal(total));

      // Optional: only show "No Data" if searchKeyword is not empty
      if (rows.length === 0) {
        // ErrorToast("No Data Found");
      }
    } else {
      store.dispatch(SetSupplierList([]));
      store.dispatch(SetSupplierListTotal(0));
      ErrorToast("Something Went Wrong");
    }
  } catch (e) {
    console.log("SupplierListRequest error:", e);
    store.dispatch(HideLoader());
    store.dispatch(SetSupplierList([]));
    store.dispatch(SetSupplierListTotal(0));
    ErrorToast("Something Went Wrong");
  }
}

// ------------------ Create or Update Supplier ------------------
export async function CreateSupplierRequest(PostBody, ObjectID) {
  try {
    store.dispatch(ShowLoader());
    let URL = `${BaseURL}/CreateSuppliers`;
    if (ObjectID !== 0) {
      URL = `${BaseURL}/UpdateSuppliers/${ObjectID}`;
    }

    const result = await axios.post(URL, PostBody, AxiosHeader);
    store.dispatch(HideLoader());

    console.log("CreateSupplierRequest response:", result.data); // debug

    if (result.status === 200 && result.data?.success === "success") {
      SuccessToast("Request Successful");
      store.dispatch(ResetSupplierFormValue());
      return true;
    } else if (result.status === 200 && result.data?.success === "fail") {
      if (result.data?.data?.keyPattern?.Phone === 1) {
        ErrorToast("Mobile Number Already Exist");
        return false;
      } else {
        ErrorToast(result.data?.message || "Request Failed");
        return false;
      }
    } else {
      ErrorToast("Request Fail! Try Again");
      return false;
    }
  } catch (e) {
    console.log("CreateSupplierRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}

// ------------------ Fill Supplier Form ------------------
export async function FillSupplierFormRequest(ObjectID) {
  store.dispatch(ShowLoader());
  try {
    const URL = `${BaseURL}/SuppliersDetailsByID/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader);

    console.log("FillSupplierFormRequest response:", result.data); // debug

    if (result.status === 200 && result.data?.status === "success") {
      const FormValue = result.data?.data?.[0];
      store.dispatch(OnChangeSupplierInput({ Name: "Name", Value: FormValue?.Name || "" }));
      store.dispatch(OnChangeSupplierInput({ Name: "Phone", Value: FormValue?.Phone || "" }));
      store.dispatch(OnChangeSupplierInput({ Name: "Email", Value: FormValue?.Email || "" }));
      store.dispatch(OnChangeSupplierInput({ Name: "Address", Value: FormValue?.Address || "" }));
      return true;
    } else {
      ErrorToast("Request Failed! Try Again");
      return false;
    }
  } catch (e) {
    console.log("FillSupplierFormRequest error:", e);
    ErrorToast("Something Went Wrong");
    return false;
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Delete Supplier ------------------
export async function DeleteSupplierRequest(ObjectID) {
  store.dispatch(ShowLoader());
  try {
    const URL = `${BaseURL}/DeleteSupplier/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader); // could be axios.delete if backend supports

    console.log("DeleteSupplierRequest response:", result.data); // debug

    if (result.status === 200 && result.data?.status === "associate") {
      ErrorToast(result.data?.data || "Cannot delete associated supplier");
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
    console.log("DeleteSupplierRequest error:", e);
    ErrorToast("Something Went Wrong");
    return false;
  } finally {
    store.dispatch(HideLoader());
  }
}
