import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { getToken } from "../helper/SessionHelper";
import {
  SetList,
  SetLoading,
  SetError,
  SetCustomersList ,
} from "../redux/state-slice/customerproduct-slice";
import { BaseURL } from "../helper/config";

const AxiosHeader = { headers: { token: getToken() } };

// ---------------- CREATE ENTRY ----------------
export const CreateCustomerProductEntryRequest = async (postData) => {
  try {
    store.dispatch(SetLoading(true));

    const res = await axios.post(`${BaseURL}/CreateCustomerProductEntry`, postData, AxiosHeader);

    if (res.data.status === "success") {
      SuccessToast("Entry Created Successfully");
      return true;
    } else {
      store.dispatch(SetError(res.data.message || "Failed to create entry"));
      return false;
    }
  } catch (error) {
    store.dispatch(SetError(error.toString()));
    return false;
  } finally {
    store.dispatch(SetLoading(false));
  }
};

// ---------------- LIST ENTRIES ----------------
export const CustomerProductEntryListRequest = async (pageNo, perPage, searchKeyword) => {
  try {
    store.dispatch(SetLoading(true));

    const res = await axios.get(`${BaseURL}/CustomerProductEntryList/${pageNo}/${perPage}/${searchKeyword}`, AxiosHeader);

    if (res.data.status === "success") {
      store.dispatch(SetList(res.data.data));
    } else {
      store.dispatch(SetError("Failed to load entries"));
    }
  } catch (error) {
    store.dispatch(SetError(error.toString()));
  } finally {
    store.dispatch(SetLoading(false));
  }
};

// ---------------- DELETE ENTRY ----------------
export const DeleteCustomerProductEntryRequest = async (id) => {
  try {
    store.dispatch(SetLoading(true));

    const res = await axios.delete(`${BaseURL}/DeleteCustomerProductEntry/${id}`, AxiosHeader);

    if (res.data.status === "success") {
      SuccessToast("Entry Deleted Successfully");
      return true;
    } else {
      store.dispatch(SetError(res.data.message || "Failed to delete entry"));
      return false;
    }
  } catch (error) {
    store.dispatch(SetError(error.toString()));
    return false;
  } finally {
    store.dispatch(SetLoading(false));
  }
};

// ------------------ DROPDOWNS ------------------
export async function FacultyDropdownRequest() {
  try {
    const result = await axios.get(`${BaseURL}/FacultyDropdown`, AxiosHeader);
    if (result.status === 200 && result.data?.status === "success")
      return result.data?.data || [];
    return [];
  } catch (e) {
    console.error("FacultyDropdownRequest error:", e);
    return [];
  }
}

export async function DepartmentDropdownRequest(facultyID = "") {
  try {
    const result = await axios.get(
      `${BaseURL}/DepartmentDropdown${facultyID ? "/" + facultyID : ""}`,
      AxiosHeader
    );
    if (result.status === 200 && result.data?.status === "success")
      return result.data?.data || [];
    return [];
  } catch (e) {
    console.error("DepartmentDropdownRequest error:", e);
    return [];
  }
}

export async function SectionDropdownRequest() {
  try {
    const result = await axios.get(`${BaseURL}/SectionDropdown`, AxiosHeader);
    if (result.status === 200 && result.data?.status === "success")
      return result.data?.data || [];
    return [];
  } catch (e) {
    console.error("SectionDropdownRequest error:", e);
    return [];
  }
}

export async function CustomerDropDownRequest(
  category = null,
  facultyID = null,
  departmentID = null,
  sectionID = null
) {
  try {
    store.dispatch(ShowLoader());
    let URL = `${BaseURL}/CustomersDropDown`;

    const params = [];
    if (category) params.push(`category=${category}`);
    if (facultyID) params.push(`facultyID=${facultyID}`);
    if (departmentID) params.push(`departmentID=${departmentID}`);
    if (sectionID) params.push(`sectionID=${sectionID}`);
    if (params.length > 0) URL += `?${params.join("&")}`;

    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && result.data?.status === "success") {
      const data = result.data?.data || [];
      store.dispatch(SetCustomersList (data));
      return data;
    } else {
      store.dispatch(SetCustomersList ([]));
      ErrorToast("No Customer Found");
      return [];
    }
  } catch (e) {
    console.error("CustomerDropDownRequest error:", e);
    store.dispatch(SetCustomersList ([]));
    ErrorToast("Something Went Wrong");
    return [];
  } finally {
    store.dispatch(HideLoader());
  }
}
