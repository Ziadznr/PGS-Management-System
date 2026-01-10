import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { getToken } from "../helper/SessionHelper";
import {
  SetBrandList,
  SetBrandListTotal,
  ResetBrandFormValue,
  OnChangeBrandInput,
} from "../redux/state-slice/brand-slice";
import { BaseURL } from "../helper/config";

const AxiosHeader = { headers: { token: getToken() } };

// ------------------ Brand List ------------------
export async function BrandListRequest(pageNo, perPage, searchKeyword) {
  try {
    store.dispatch(ShowLoader());
    let URL = `${BaseURL}/BrandList/${pageNo}/${perPage}/${searchKeyword}`;
    const result = await axios.get(URL, AxiosHeader);
    store.dispatch(HideLoader());

    console.log("BrandList API result:", result.data);

    // Fix this condition
    if (result.status === 200 && result.data.success === "success") {
      const data = result.data.data[0]; // your Rows and Total
      if (data?.Rows?.length > 0) {
        store.dispatch(SetBrandList(data.Rows));
        store.dispatch(SetBrandListTotal(data.Total[0].count));
      } else {
        store.dispatch(SetBrandList([]));
        store.dispatch(SetBrandListTotal(0));
        ErrorToast("No Data Found");
      }
    } else {
      store.dispatch(SetBrandList([]));
      store.dispatch(SetBrandListTotal(0));
      ErrorToast("Something Went Wrong");
    }
  } catch (e) {
    console.log("BrandListRequest error:", e);
    store.dispatch(HideLoader());
    store.dispatch(SetBrandList([]));
    store.dispatch(SetBrandListTotal(0));
    ErrorToast("Something Went Wrong");
  }
}




// ------------------ Create or Update Brand ------------------
export async function CreateBrandRequest(PostBody, ObjectID) {
    try {
        store.dispatch(ShowLoader());
        let URL = BaseURL + "/CreateBrand";
        if (ObjectID !== 0) {
            URL = BaseURL + "/UpdateBrand/" + ObjectID;
        }

        const result = await axios.post(URL, PostBody, AxiosHeader);
        store.dispatch(HideLoader());

        console.log("CreateBrandRequest API response:", result.data); // debug

        if (result.status === 200 && (result.data.status === "success" || result.data.success === "success")) {
            SuccessToast("Request Successful");
            store.dispatch(ResetBrandFormValue());
            return true;
        }

        // handle key pattern error for duplicate name
        if (result.status === 200 && result.data.status === "fail") {
            if (result.data?.data?.keyPattern?.Name === 1) {
                ErrorToast("Brand Name Already Exist");
            } else {
                ErrorToast(result.data?.message || "Request Failed");
            }
            return false;
        }

        ErrorToast("Request Failed! Try Again");
        return false;
    } catch (e) {
        console.log("CreateBrandRequest error:", e);
        ErrorToast("Something Went Wrong");
        store.dispatch(HideLoader());
        return false;
    }
}


// ------------------ Fill Brand Form ------------------
export async function FillBrandFormRequest(ObjectID) {
  try {
    store.dispatch(ShowLoader());
    let URL = `${BaseURL}/BrandDetailsByID/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader);
    store.dispatch(HideLoader());

    if (result.status === 200 && result.data?.status === "success") {
      const FormValue = result.data?.data?.[0];
      store.dispatch(OnChangeBrandInput({ Name: "Name", Value: FormValue?.Name || "" }));
      return true;
    } else {
      ErrorToast("Request Fail! Try Again");
      return false;
    }
  } catch (e) {
    console.log("FillBrandFormRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}

// ------------------ Delete Brand ------------------
export async function DeleteBrandRequest(ObjectID) {
  try {
    store.dispatch(ShowLoader());
    let URL = `${BaseURL}/DeleteBrand/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader); // ✅ Use DELETE instead of GET
    store.dispatch(HideLoader());

    if (result.status === 200 && result.data?.status === "associate") {
      ErrorToast(result.data?.data || "Cannot delete associated brand");
      return false;
    }

    if (result.status === 200 && result.data?.status === "success") {
      SuccessToast("Request Successful");
      return true;
    } else {
      ErrorToast("Request Fail! Try Again");
      return false;
    }
  } catch (e) {
    console.log("DeleteBrandRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}
