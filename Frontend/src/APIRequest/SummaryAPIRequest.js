import axios from "axios";
import { ErrorToast } from "../helper/FormHelper";
import store from "../redux/store/store";
import { HideLoader, ShowLoader } from "../redux/state-slice/settings-slice";
import { getToken, removeSessions } from "../helper/SessionHelper";
import {
    SetExpenseChart,
    SetExpenseTotal,
    SetPurchaseChart,
    SetPurchaseTotal,
    SetReturnChart,
    SetReturnTotal,
    SetSaleChart,
    SetSaleTotal
} from "../redux/state-slice/dashboard-slice";
import { BaseURL } from "../helper/config";

const getAxiosHeader = () => ({ headers: { token: getToken() } });

async function fetchSummary(url, setChartAction, setTotalAction) {
    try {
        store.dispatch(ShowLoader());
        const res = await axios.get(url, getAxiosHeader());
        store.dispatch(HideLoader());

        if (res.status === 200) {
            const chartData = res?.data?.data?.[0]?.Last30Days || [];
            const totalAmount = res?.data?.data?.[0]?.Total?.[0]?.TotalAmount || 0;
            store.dispatch(setChartAction(chartData));
            store.dispatch(setTotalAction(totalAmount));
        } else {
            ErrorToast("Something Went Wrong");
        }
    } catch (e) {
        store.dispatch(HideLoader());
        if (e.response?.status === 401) removeSessions();
        else ErrorToast(e.response?.data?.message || "Something Went Wrong");
    }
}

export async function ExpensesSummary() {
    await fetchSummary(`${BaseURL}/ExpensesSummary`, SetExpenseChart, SetExpenseTotal);
}

// export async function ReturnSummary() {
//     await fetchSummary(`${BaseURL}/ReturnSummary`, SetReturnChart, SetReturnTotal);
// }

export async function SaleSummary() {
    await fetchSummary(`${BaseURL}/SalesSummary`, SetSaleChart, SetSaleTotal);
}

export async function PurchaseSummary() {
    await fetchSummary(`${BaseURL}/PurchaseSummary`, SetPurchaseChart, SetPurchaseTotal);
}
