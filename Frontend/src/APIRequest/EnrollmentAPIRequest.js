import store from "../redux/store/store";
import { ShowLoader, HideLoader } from "../redux/state-slice/settings-slice";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../helper/FormHelper";
import { BaseURL } from "../helper/config";
import {
  getTempEnrollment,
  clearTempEnrollment
} from "../helper/SessionHelper";

/* =================================================
   AXIOS HEADER (TEMP ENROLLMENT SESSION)
================================================= */
const TempEnrollmentHeader = () => {
  const temp = getTempEnrollment();
  return {
    headers: {
      "x-temp-login-id": temp?.loginId
    }
  };
};

/* =================================================
   CREATE / UPDATE ENROLLMENT (DRAFT)
================================================= */
export async function CreateOrUpdateEnrollmentRequest(PostBody) {
  try {
    const temp = getTempEnrollment();
    if (!temp?.applicationId) {
      ErrorToast("Enrollment session expired");
      return false;
    }

    store.dispatch(ShowLoader());

    const URL = `${BaseURL}/create-or-update`;

    const payload = {
      ...PostBody,
      applicationId: temp.applicationId
    };

    const result = await axios.post(
      URL,
      payload,
      TempEnrollmentHeader()
    );

    store.dispatch(HideLoader());

    if (result.status === 200 && result.data?.status === "success") {
      SuccessToast("Enrollment form saved");
      return true;
    }

    ErrorToast(result.data?.data || "Failed to save enrollment");
    return false;

  } catch (e) {
    console.error("CreateOrUpdateEnrollmentRequest error:", e);
    store.dispatch(HideLoader());
    ErrorToast("Something went wrong");
    return false;
  }
}

/* =================================================
   LOAD ENROLLMENT DETAILS (IF EXISTS)
================================================= */
export async function EnrollmentDetailsRequest() {
  try {
    const temp = getTempEnrollment();

    console.log("TEMP ENROLLMENT:", temp); // 🔍 DEBUG

    if (!temp?.loginId) {
      console.warn("Missing loginId");
      return null;
    }

    const URL = `${BaseURL}/enrollment/details`;

    const result = await axios.get(URL, {
      headers: {
        "x-temp-login-id": temp.loginId
      }
    });

    if (result.status === 200 && result.data?.status === "success") {
      return result.data.data;
    }

    return null;
  } catch (e) {
    console.error("EnrollmentDetailsRequest error:", e.response?.data || e);
    return null;
  }
}




/* =================================================
   SUBMIT ENROLLMENT (FINAL LOCK)
================================================= */
export async function SubmitEnrollmentRequest() {
  try {
    const temp = getTempEnrollment();
    if (!temp?.applicationId) {
      ErrorToast("Enrollment session expired");
      return false;
    }

    store.dispatch(ShowLoader());

    const URL = `${BaseURL}/enrollment/submit/${temp.applicationId}`;

    const result = await axios.post(
      URL,
      {},
      TempEnrollmentHeader()
    );

    store.dispatch(HideLoader());

    if (result.status === 200 && result.data?.status === "success") {
      SuccessToast("Enrollment submitted successfully");
      clearTempEnrollment();
      return true;
    }

    ErrorToast(result.data?.data || "Submission failed");
    return false;

  } catch (e) {
    console.error("SubmitEnrollmentRequest error:", e);
    store.dispatch(HideLoader());
    ErrorToast("Something went wrong");
    return false;
  }
}
