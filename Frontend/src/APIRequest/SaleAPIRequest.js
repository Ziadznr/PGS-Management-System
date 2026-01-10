import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { getToken } from "../helper/SessionHelper";
import {
  SetCustomerDropDown,
  SetProductDropDown,
  SetSaleList,
  SetSaleListTotal
} from "../redux/state-slice/sale-slice";
import { BaseURL } from "../helper/config";

const AxiosHeader = { headers: { token: getToken() } };

// ------------------ Sale List ------------------
export async function SaleListRequest(pageNo, perPage, searchKeyword = "0", customerId) {
  try {
    store.dispatch(ShowLoader());
    const keyword = encodeURIComponent(searchKeyword || "0");

    // Build URL
    let URL = `${BaseURL}/SalesList/${pageNo}/${perPage}/${keyword}`;
    if (customerId) URL += `/${customerId}`;  // only append if defined

    console.log("📌 SaleListRequest URL:", URL);

    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && result.data?.status === "success") {
      store.dispatch(SetSaleList(result.data.data || []));
      store.dispatch(SetSaleListTotal(result.data.total || 0));
    } else {
      store.dispatch(SetSaleList([]));
      store.dispatch(SetSaleListTotal(0));
      ErrorToast("Something Went Wrong");
    }
  } catch (e) {
    console.error("❌ SaleListRequest Error:", e);
    store.dispatch(SetSaleList([]));
    store.dispatch(SetSaleListTotal(0));
    ErrorToast("Something Went Wrong");
  } finally {
    store.dispatch(HideLoader());
  }
}


// ------------------ Customer Dropdown ------------------
export async function CustomerDropDownRequest(
  category = null,
  facultyID = null,
  departmentID = null,
  sectionID = null,
  userRole = "Customer" // Pass userRole
) {
  try {
    store.dispatch(ShowLoader());
    let URL = `${BaseURL}/CustomersDropDown`;
    const params = [];

    if (category) params.push(`category=${category}`);
    if (facultyID) params.push(`facultyID=${facultyID}`);
    if (departmentID) params.push(`departmentID=${departmentID}`);
    if (sectionID) params.push(`sectionID=${sectionID}`);
    if (userRole) params.push(`userRole=${userRole}`);
    if (params.length > 0) URL += `?${params.join("&")}`;

    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && result.data?.status === "success") {
      const data = result.data.data || [];
      store.dispatch(SetCustomerDropDown(data));
      return data;
    } else {
      store.dispatch(SetCustomerDropDown([]));
      ErrorToast("No Customer Found");
      return [];
    }
  } catch (e) {
    console.error("CustomerDropDownRequest error:", e);
    store.dispatch(SetCustomerDropDown([]));
    ErrorToast("Something Went Wrong");
    return [];
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Product Dropdown ------------------
export async function ProductDropDownRequest() {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/ProductsDropDown`;
    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && result.data?.status === "success") {
      const data = (result.data.data || []).map(p => ({
        ...p,
        Stock: p.Stock ?? 0
      }));

      store.dispatch(SetProductDropDown(data));
      if (data.length === 0) ErrorToast("No Product Found");
      return data;
    } else {
      store.dispatch(SetProductDropDown([]));
      ErrorToast("Something Went Wrong");
      return [];
    }
  } catch (e) {
    console.error("ProductDropDownRequest Error:", e);
    store.dispatch(SetProductDropDown([]));
    ErrorToast("Something Went Wrong");
    return [];
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Create Sale ------------------
export async function CreateSaleRequest(ParentBody, ChildsBody) {
  try {
    store.dispatch(ShowLoader());
    const PostBody = { Parent: ParentBody, Childs: ChildsBody };
    const URL = `${BaseURL}/CreateSales`;
    const result = await axios.post(URL, PostBody, AxiosHeader);

    if (result.status === 200 && result.data?.status === "success") {
      SuccessToast("Sale Created Successfully");
      return true;
    } else {
      ErrorToast("Request Failed! Try Again");
      return false;
    }
  } catch (e) {
    console.error("CreateSaleRequest Error:", e);
    ErrorToast("Something Went Wrong");
    return false;
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Faculty Dropdown ------------------
export async function FacultyDropdownRequest() {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/FacultyDropdown`;
    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && result.data?.status === "success") {
      return result.data.data || [];
    } else {
      return [];
    }
  } catch (e) {
    console.error("FacultyDropdownRequest error:", e);
    return [];
  } finally {
    store.dispatch(HideLoader());
  }
}

// ------------------ Department Dropdown ------------------
export async function DepartmentDropdownRequest(facultyID = "") {
  try {
    const URL = `${BaseURL}/DepartmentDropdown${facultyID ? "/" + facultyID : ""}`;
    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && result.data?.status === "success") {
      return result.data.data || [];
    } else {
      return [];
    }
  } catch (e) {
    console.error("DepartmentDropdownRequest error:", e);
    return [];
  }
}

// ------------------ Section Dropdown ------------------
export async function SectionDropdownRequest() {
  try {
    const URL = `${BaseURL}/SectionDropdown`;
    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && result.data?.status === "success") {
      return result.data.data || [];
    } else {
      return [];
    }
  } catch (e) {
    console.error("SectionDropdownRequest error:", e);
    return [];
  }
}
