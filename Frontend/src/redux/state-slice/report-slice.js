import { createSlice } from "@reduxjs/toolkit";

export const reportSlice = createSlice({
  name: "report",
  initialState: {
    SalesByDateList: [],
    ExpensesByDateList: [],
    PurchaseByDateList: [],
    ReturnByDateList: [],
    CustomerProductReportList: [],
    CustomerProductReportTotal: {},   // ✅ Added total summary holder
  },
  reducers: {
    SetSalesByDateList: (state, action) => {
      state.SalesByDateList = action.payload;
    },
    SetExpensesByDateList: (state, action) => {
      state.ExpensesByDateList = action.payload;
    },
    SetPurchaseByDateList: (state, action) => {
      state.PurchaseByDateList = action.payload;
    },
    SetReturnByDateList: (state, action) => {
      state.ReturnByDateList = action.payload;
    },
    SetCustomerProductReportList: (state, action) => {
      state.CustomerProductReportList = action.payload;
    },
    SetCustomerProductReportTotal: (state, action) => {   // ✅ new reducer
      state.CustomerProductReportTotal = action.payload;
    },
  },
});

export const {
  SetSalesByDateList,
  SetExpensesByDateList,
  SetPurchaseByDateList,
  SetReturnByDateList,
  SetCustomerProductReportList,
  SetCustomerProductReportTotal,
} = reportSlice.actions;

export default reportSlice.reducer;
