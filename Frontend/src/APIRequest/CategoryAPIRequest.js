import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { getToken } from "../helper/SessionHelper";
import {
  SetCategoryList,
  SetCategoryListTotal,
  ResetCategoryFormValue,
  OnChangeCategoryInput,
} from "../redux/state-slice/category-slice";
import { BaseURL } from "../helper/config";

const AxiosHeader = { headers: { token: getToken() } };

// ------------------ Category List ------------------
export async function CategoryListRequest(pageNo, perPage, searchKeyword) {
  try {
    store.dispatch(ShowLoader());
    let URL = `${BaseURL}/CategoriesList/${pageNo}/${perPage}/${searchKeyword}`;
    const result = await axios.get(URL, AxiosHeader);
    store.dispatch(HideLoader());

    console.log("CategoryList API result:", result.data);

    if (result.status === 200 && (result.data.status === "success" || result.data.success === "success")) {
      const data = result.data.data?.[0];
      if (data?.Rows?.length > 0) {
        store.dispatch(SetCategoryList(data.Rows));
        store.dispatch(SetCategoryListTotal(data.Total?.[0]?.count || 0));
      } else {
        store.dispatch(SetCategoryList([]));
        store.dispatch(SetCategoryListTotal(0));
        ErrorToast("No Data Found");
      }
    } else {
      store.dispatch(SetCategoryList([]));
      store.dispatch(SetCategoryListTotal(0));
      ErrorToast("Something Went Wrong");
    }
  } catch (e) {
    console.log("CategoryListRequest error:", e);
    store.dispatch(HideLoader());
    store.dispatch(SetCategoryList([]));
    store.dispatch(SetCategoryListTotal(0));
    ErrorToast("Something Went Wrong");
  }
}

// ------------------ Create or Update Category ------------------
export async function CreateCategoryRequest(PostBody, ObjectID) {
  try {
    store.dispatch(ShowLoader());
    let URL = BaseURL + "/CreateCategories";
    if (ObjectID !== 0) {
      URL = BaseURL + "/UpdateCategories/" + ObjectID;
    }

    const result = await axios.post(URL, PostBody, AxiosHeader);
    store.dispatch(HideLoader());

    console.log("CreateCategoryRequest API response:", result.data);

    if (result.status === 200 && (result.data.status === "success" || result.data.success === "success")) {
      SuccessToast("Request Successful");
      store.dispatch(ResetCategoryFormValue());
      return true;
    }

    if (result.status === 200 && result.data.status === "fail") {
      if (result.data?.data?.keyPattern?.Name === 1) {
        ErrorToast("Category Already Exist");
      } else {
        ErrorToast(result.data?.message || "Request Failed");
      }
      return false;
    }

    ErrorToast("Request Failed! Try Again");
    return false;
  } catch (e) {
    console.log("CreateCategoryRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}

// ------------------ Fill Category Form ------------------
export async function FillCategoryFormRequest(ObjectID) {
  try {
    store.dispatch(ShowLoader());
    let URL = `${BaseURL}/CategoriesDetailsByID/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader);
    store.dispatch(HideLoader());

    if (result.status === 200 && result.data?.status === "success") {
      const FormValue = result.data?.data?.[0];
      store.dispatch(OnChangeCategoryInput({ Name: "Name", Value: FormValue?.Name || "" }));
      return true;
    } else {
      ErrorToast("Request Fail! Try Again");
      return false;
    }
  } catch (e) {
    console.log("FillCategoryFormRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}

// ------------------ Delete Category ------------------
export async function DeleteCategoryRequest(ObjectID) {
  try {
    store.dispatch(ShowLoader());
    let URL = `${BaseURL}/DeleteCategories/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader); // ✅ You may later switch to axios.delete
    store.dispatch(HideLoader());

    if (result.status === 200 && result.data?.status === "associate") {
      ErrorToast(result.data?.data || "Cannot delete associated category");
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
    console.log("DeleteCategoryRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}
