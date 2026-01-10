import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { getToken } from "../helper/SessionHelper";
import {
  SetCustomerDropDown,
  SetProductDropDown,
  SetReturnList,
  SetReturnListTotal,
} from "../redux/state-slice/return-slice";
import { BaseURL } from "../helper/config";

const AxiosHeader = { headers: { token: getToken() } };


export async function ReturnListRequest(pageNo, perPage, searchKeyword = "0") {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/ReturnsList/${pageNo}/${perPage}/${searchKeyword || "0"}`;
    console.log("ReturnListRequest URL:", URL);

    const result = await axios.get(URL, AxiosHeader);
    console.log("📌 Raw API result:", result.data);

    if (result.status === 200 && result.data?.status === "success") {
      const rows = (result.data?.data || []).map(row => ({
        ...row,
        Products: row.Products || []  // ensure products exist
      }));
      const total = rows.length; // replace if backend provides total

      console.log("📌 Processed Rows with products:", rows);
      store.dispatch(SetReturnList(rows));
      store.dispatch(SetReturnListTotal(total));

      if (rows.length === 0) ErrorToast("No Data Found");
      return rows;
    } else {
      store.dispatch(SetReturnList([]));
      store.dispatch(SetReturnListTotal(0));
      ErrorToast("Something Went Wrong");
      return [];
    }
  } catch (e) {
    console.error("ReturnListRequest Error:", e);
    store.dispatch(SetReturnList([]));
    store.dispatch(SetReturnListTotal(0));
    ErrorToast("Something Went Wrong");
    return [];
  } finally {
    store.dispatch(HideLoader());
  }
}




// ------------------ Customer Dropdown ------------------
export async function CustomerDropDownRequest(category = null, facultyID = null, departmentID = null, sectionID = null) {
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
export async function ProductDropDownRequest(customerId, slipNo) {
  if (!customerId || !slipNo) {
    ErrorToast("Please select Customer and SlipNo first");
    store.dispatch(SetProductDropDown([]));
    return [];
  }

  try {
    store.dispatch(ShowLoader());

    // Build URL with query params
    const URL = `${BaseURL}/ReturnProductsDropdown?customerId=${customerId}&slipNo=${encodeURIComponent(slipNo)}`;

    console.log("📌 ProductDropDownRequest URL:", URL);

    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && result.data?.status === "success") {
      const data = (result.data?.data || []).map(p => ({
        ...p,
        Stock: p.Stock ?? 0, // ensure Stock is defined
      }));

      console.log("📌 ProductDropdown final data:", data);

      store.dispatch(SetProductDropDown(data));

      if (data.length === 0) ErrorToast("No Product Found for this Customer & SlipNo");
      return data;
    } else {
      store.dispatch(SetProductDropDown([]));
      ErrorToast("No Product Found for this Customer & SlipNo");
      return [];
    }
  } catch (e) {
    console.error("ProductDropDownRequest Error:", e);
    store.dispatch(SetProductDropDown([]));
    ErrorToast("Something Went Wrong while fetching products");
    return [];
  } finally {
    store.dispatch(HideLoader());
  }
}



// ------------------ Create Return ------------------
export async function CreateReturnRequest(ParentBody, ChildsBody) {
  try {
    store.dispatch(ShowLoader());
    const PostBody = {
      Parent: {
        ...ParentBody,
        GivenDate: ParentBody.GivenDate || null, // ✅ ensure given date sent
      },
      Childs: ChildsBody,
    };
    const URL = `${BaseURL}/CreateReturns`;

    const result = await axios.post(URL, PostBody, AxiosHeader);

    if (result.status === 200 && result.data?.status === "success") {
      SuccessToast("Return Created Successfully");
      return true;
    } else {
      ErrorToast("Request Failed! Try Again");
      return false;
    }
  } catch (e) {
    console.error("CreateReturnRequest Error:", e);
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

    console.log("📌 FacultyDropdown raw Axios response:", result); // ✅ check full Axios response
    console.log("📌 FacultyDropdown response.data:", result.data);   // ✅ check backend JSON

    if (result.status === 200 && result.data?.status === "success") {
      const data = result.data?.data || [];
      console.log("📌 FacultyDropdown final data array:", data); // ✅ what will be returned
      return data;
    } else {
      console.warn("FacultyDropdownRequest: status not success");
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

    console.log("📌 DepartmentDropdown response.data:", result.data);

    if (result.status === 200 && result.data?.status === "success") {
      return result.data.data || [];
    } else {
      console.error("DepartmentDropdownRequest: status not success");
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

    console.log("📌 SectionDropdown raw Axios response:", result);
    console.log("📌 SectionDropdown response.data:", result.data);

    // Check correctly if status is "success"
    if (result.status === 200 && result.data?.status === "success") {
      const data = result.data?.data || [];
      console.log("📌 SectionDropdown final data array:", data);
      return data;
    } else {
      console.warn("SectionDropdownRequest: status not success");
      return [];
    }
  } catch (e) {
    console.error("SectionDropdownRequest error:", e);
    return [];
  }
};

// ------------------ Slip Dropdown ------------------
export async function SlipDropdownRequest(customerId) {
  if (!customerId) {
    ErrorToast("Customer ID is required for Slip Dropdown");
    return [];
  }

  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/ReturnSlipDropdown?customerId=${customerId}`;
    console.log("📌 SlipDropdownRequest URL:", URL);

    const result = await axios.get(URL, AxiosHeader);

    if (result.status === 200 && result.data?.status === "success") {
      const data = result.data?.data || [];
      console.log("📌 SlipDropdown final data:", data);
      return data;
    } else {
      console.warn("SlipDropdownRequest: no slip found or status not success");
      return [];
    }
  } catch (e) {
    console.error("SlipDropdownRequest error:", e);
    ErrorToast("Something went wrong while fetching slip numbers");
    return [];
  } finally {
    store.dispatch(HideLoader());
  }
}
