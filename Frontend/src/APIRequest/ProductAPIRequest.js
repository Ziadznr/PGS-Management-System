import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { getToken } from "../helper/SessionHelper";
import {
  OnChangeProductInput,
  ResetProductFormValue,
  SetProductBrandDropDown,
  SetProductCategoryDropDown,
  SetProductList,
  SetProductListTotal,
} from "../redux/state-slice/product-slice";
import { BaseURL } from "../helper/config";

const AxiosHeader = { headers: { token: getToken() } };

// ------------------ Product List ------------------
export async function ProductListRequest(pageNo, perPage, searchKeyword) {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/ProductsList/${pageNo}/${perPage}/${searchKeyword}`;
    const result = await axios.get(URL, AxiosHeader);
    store.dispatch(HideLoader());

    if (result.status === 200 && result.data.status === "success") {
      const data = result.data.data?.[0];
      if (data?.Rows?.length > 0) {
        store.dispatch(SetProductList(data.Rows));
        store.dispatch(SetProductListTotal(data.Total?.[0]?.count || 0));
      } else {
        store.dispatch(SetProductList([]));
        store.dispatch(SetProductListTotal(0));
        ErrorToast("No Data Found");
      }
    } else {
      ErrorToast("Something Went Wrong");
    }
  } catch (e) {
    console.log("ProductListRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
  }
}

// ------------------ Create or Update Product ------------------
export async function CreateProductRequest(PostBody, ObjectID) {
  try {
    store.dispatch(ShowLoader());
    let URL = `${BaseURL}/CreateProduct`;
    if (ObjectID !== 0) URL = `${BaseURL}/UpdateProduct/${ObjectID}`;

    const result = await axios.post(URL, PostBody, AxiosHeader);
    store.dispatch(HideLoader());

    if (
      result.status === 200 &&
      (result.data.status === "success" || result.data.success === "success")
    ) {
      SuccessToast("Request Successful");
      store.dispatch(ResetProductFormValue());
      return true;
    }

    ErrorToast("Request Fail! Try Again");
    return false;
  } catch (e) {
    console.log("CreateProductRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}

// ------------------ Fill Product Form ------------------
export async function FillProductFormRequest(ObjectID) {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/ProductsDetailsByID/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader);
    store.dispatch(HideLoader());

    if (result.status === 200 && result.data.status === "success") {
      const FormValue = result.data.data?.[0];
      store.dispatch(
        OnChangeProductInput({ Name: "CategoryID", Value: FormValue?.CategoryID || "" })
      );
      store.dispatch(
        OnChangeProductInput({ Name: "BrandID", Value: FormValue?.BrandID || "" })
      );
      store.dispatch(OnChangeProductInput({ Name: "Name", Value: FormValue?.Name || "" }));
      store.dispatch(OnChangeProductInput({ Name: "Details", Value: FormValue?.Details || "" }));
      // Stock is NOT updated here, handled in Purchases
      return true;
    } else {
      ErrorToast("Request Fail! Try Again");
      return false;
    }
  } catch (e) {
    console.log("FillProductFormRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}

// ------------------ Product Category DropDown ------------------
export async function ProductCategoryDropDownRequest() {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/CategoriesDropDown`;
    const result = await axios.get(URL, AxiosHeader);
    store.dispatch(HideLoader());

    if (result.status === 200 && result.data.status === "success") {
      store.dispatch(SetProductCategoryDropDown(result.data.data || []));
    } else {
      store.dispatch(SetProductCategoryDropDown([]));
      ErrorToast("No Product Category Found");
    }
  } catch (e) {
    console.log("ProductCategoryDropDownRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
  }
}

// ------------------ Product Brand DropDown ------------------
export async function ProductBrandDropDownRequest() {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/BrandDropDown`;
    const result = await axios.get(URL, AxiosHeader);
    store.dispatch(HideLoader());

    if (result.status === 200 && result.data.status === "success") {
      store.dispatch(SetProductBrandDropDown(result.data.data || []));
    } else {
      store.dispatch(SetProductBrandDropDown([]));
      ErrorToast("No Product Brand Found");
    }
  } catch (e) {
    console.log("ProductBrandDropDownRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
  }
}

// ------------------ Delete Product ------------------
export async function DeleteProductRequest(ObjectID) {
  try {
    store.dispatch(ShowLoader());
    const URL = `${BaseURL}/DeleteProduct/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader); // ✅ updated to delete
    store.dispatch(HideLoader());

    if (result.status === 200 && result.data.status === "associate") {
      ErrorToast(result.data.data || "This product is associated, cannot delete");
      return false;
    } else if (result.status === 200 && result.data.status === "success") {
      SuccessToast("Request Successful");
      return true;
    } else {
      ErrorToast("Request Fail! Try Again");
      return false;
    }
  } catch (e) {
    console.log("DeleteProductRequest error:", e);
    ErrorToast("Something Went Wrong");
    store.dispatch(HideLoader());
    return false;
  }
}
