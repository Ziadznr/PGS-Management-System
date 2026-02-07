import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { getAdminToken } from "../helper/SessionHelper";
import {
  SetHallList,
  SetHallListTotal,
  ResetHallFormValue,
  OnChangeHallInput
} from "../redux/state-slice/hall-slice";
import { BaseURL } from "../helper/config";

const AxiosHeader = { headers: { token: getAdminToken() } };

/* =================================================
   HALL LIST
================================================= */
export async function HallListRequest() {
  try {
    store.dispatch(ShowLoader());

    const URL = `${BaseURL}/admin/hall/list`;
    const result = await axios.get(URL, AxiosHeader);

    store.dispatch(HideLoader());

    if (result.status === 200 && result.data?.status === "success") {
      const rows = result.data.data || [];

      store.dispatch(SetHallList(rows));
      store.dispatch(SetHallListTotal(rows.length));

      if (rows.length === 0) {
        ErrorToast("No halls found");
      }

      return true;
    }

    store.dispatch(SetHallList([]));
    store.dispatch(SetHallListTotal(0));
    ErrorToast("Failed to load halls");
    return false;

  } catch (e) {
    console.error("HallListRequest error:", e);
    store.dispatch(HideLoader());
    ErrorToast("Something went wrong");
    return false;
  }
}


/* =================================================
   CREATE / UPDATE HALL
================================================= */
export async function CreateHallRequest(PostBody) {
  try {
    store.dispatch(ShowLoader());

    const URL = `${BaseURL}/admin/hall/create-update`;
    const result = await axios.post(URL, PostBody, AxiosHeader);

    store.dispatch(HideLoader());

    if (result.status === 200 && result.data?.status === "success") {
      SuccessToast("Hall saved successfully");
      store.dispatch(ResetHallFormValue());
      return true;
    }

    ErrorToast(result.data?.data || "Request failed");
    return false;

  } catch (e) {
    console.error("CreateHallRequest error:", e);
    store.dispatch(HideLoader());
    ErrorToast("Something went wrong");
    return false;
  }
}


/* =================================================
   FILL HALL FORM (EDIT)
================================================= */
export async function FillHallFormRequest(ObjectID) {
  try {
    store.dispatch(ShowLoader());

    const URL = `${BaseURL}/admin/hall/details/${ObjectID}`;
    const result = await axios.get(URL, AxiosHeader);

    store.dispatch(HideLoader());

    if (result.status === 200 && result.data?.status === "success") {
      const data = result.data?.data;

      store.dispatch(
        OnChangeHallInput({ Name: "name", Value: data?.name || "" })
      );
      store.dispatch(
        OnChangeHallInput({ Name: "code", Value: data?.code || "" })
      );
      store.dispatch(
        OnChangeHallInput({
          Name: "description",
          Value: data?.description || ""
        })
      );

      return true;
    }

    ErrorToast("Failed to load hall");
    return false;

  } catch (e) {
    console.error("FillHallFormRequest error:", e);
    store.dispatch(HideLoader());
    ErrorToast("Something went wrong");
    return false;
  }
}

/* =================================================
   DELETE HALL
================================================= */
export async function DeleteHallRequest(ObjectID) {
  try {
    store.dispatch(ShowLoader());

    const URL = `${BaseURL}/admin/hall/delete/${ObjectID}`;
    const result = await axios.delete(URL, AxiosHeader);

    store.dispatch(HideLoader());

    if (result.status === 200 && result.data?.status === "success") {
      SuccessToast("Hall deleted successfully");
      return true;
    }

    ErrorToast(result.data?.data || "Cannot delete hall");
    return false;

  } catch (e) {
    console.error("DeleteHallRequest error:", e);
    store.dispatch(HideLoader());
    ErrorToast("Something went wrong");
    return false;
  }
}

/* =================================================
   HALL DROPDOWN (PROVOST CREATE)
================================================= */
export async function HallDropdownRequest() {
  try {
    const result = await axios.get(`${BaseURL}/hall/dropdown`);
    return result.data?.status === "success"
      ? result.data.data
      : [];
  } catch (e) {
    console.error("HallDropdownRequest error:", e);
    return [];
  }
}

