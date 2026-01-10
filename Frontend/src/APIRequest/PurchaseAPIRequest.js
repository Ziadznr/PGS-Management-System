import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { getToken } from "../helper/SessionHelper";
import {
  SetPurchaseList,
  SetPurchaseListTotal,
  SetSupplierDropDown,
  SetProductDropDown,
} from "../redux/state-slice/purchase-slice";
import { BaseURL } from "../helper/config";

const AxiosHeader = { headers: { token: getToken() } };

// ------------------ Purchase List ------------------
export async function PurchaseListRequest(pageNo, perPage, searchKeyword = "0") {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/PurchasesList/${pageNo}/${perPage}/${searchKeyword}`;
    const result = await axios.get(URL, AxiosHeader);

    console.log("PurchaseList API result:", result.data);

    if (result.status === 200 && result.data.status === "success") {
      const data = result.data.data || [];
      if (data.length > 0) {
        store.dispatch(SetPurchaseList(data));
        store.dispatch(SetPurchaseListTotal(data.length));
      } else {
        store.dispatch(SetPurchaseList([]));
        store.dispatch(SetPurchaseListTotal(0));
        ErrorToast("No Data Found");
      }
    } else {
      store.dispatch(SetPurchaseList([]));
      store.dispatch(SetPurchaseListTotal(0));
      ErrorToast("Something Went Wrong");
    }
  } catch (e) {
    console.error("PurchaseListRequest error:", e);
    store.dispatch(SetPurchaseList([]));
    store.dispatch(SetPurchaseListTotal(0));
    ErrorToast("Something Went Wrong");
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Product DropDown ------------------
export async function ProductDropDownRequest() {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/ProductsDropDown`;
    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && result.data.status === "success") {
      const products = result.data.data || [];
      store.dispatch(SetProductDropDown(products));
      if (products.length === 0) ErrorToast("No Product Found");
      return products;
    } else {
      store.dispatch(SetProductDropDown([]));
      ErrorToast("Something Went Wrong");
      return [];
    }
  } catch (e) {
    console.error("ProductDropDownRequest error:", e);
    store.dispatch(SetProductDropDown([]));
    ErrorToast("Something Went Wrong");
    return [];
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Supplier DropDown ------------------
export async function SupplierDropDownRequest() {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/SuppliersDropDown`;
    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && result.data.status === "success") {
      const suppliers = result.data.data || [];
      store.dispatch(SetSupplierDropDown(suppliers));
      if (suppliers.length === 0) ErrorToast("No Supplier Found");
      return suppliers;
    } else {
      store.dispatch(SetSupplierDropDown([]));
      ErrorToast("Something Went Wrong");
      return [];
    }
  } catch (e) {
    console.error("SupplierDropDownRequest error:", e);
    store.dispatch(SetSupplierDropDown([]));
    ErrorToast("Something Went Wrong");
    return [];
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Create Purchase ------------------
export async function CreatePurchaseRequest(ParentBody, ChildsBody) {
  try {
    store.dispatch(ShowLoader());
    const PostBody = { Parent: ParentBody, Childs: ChildsBody };
    const URL = `${BaseURL}/CreatePurchases`;
    const result = await axios.post(URL, PostBody, AxiosHeader);

    console.log("CreatePurchaseRequest API response:", result.data);

    if (result.status === 200 && result.data.status === "success") {
      SuccessToast("Purchase Created Successfully");
      return true;
    } else {
      console.error("CreatePurchaseRequest failed:", result.data);
      ErrorToast(result.data.message || "Purchase creation failed");
      return false;
    }
  } catch (e) {
    console.error("CreatePurchaseRequest error:", e.response || e.message);
    ErrorToast("Something Went Wrong");
    return false;
  } finally {
    store.dispatch(HideLoader());
  }
}
