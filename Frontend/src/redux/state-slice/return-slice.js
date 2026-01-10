import { createSlice } from "@reduxjs/toolkit";

export const returnSlice = createSlice({
  name: "return",
  initialState: {
    List: [],
    ListTotal: 0,
    CustomerDropDown: [],
    ProductDropDown: [],
    ReturnFormValue: {
      CustomerID: "",
      SlipNo: "",       // 🔹 Added SlipNo field for dropdown
      Reason: "",
      GivenDate: "",    // ✅ Manual sale/return date
    },
    ReturnItemList: [], // Products added to return
  },
  reducers: {
    // 🔹 Set entire return list
    SetReturnList: (state, action) => {
      state.List = action.payload;
    },

    // 🔹 Set total number of return entries
    SetReturnListTotal: (state, action) => {
      state.ListTotal = action.payload;
    },

    // 🔹 Set customer dropdown options
    SetCustomerDropDown: (state, action) => {
      state.CustomerDropDown = action.payload;
    },

    // 🔹 Set product dropdown options (based on selected customer + slip)
    SetProductDropDown: (state, action) => {
      state.ProductDropDown = action.payload;
    },

    // 🔹 Handle input changes in the return form
    OnChangeReturnInput: (state, action) => {
      state.ReturnFormValue[action.payload.Name] = action.payload.Value;
    },

    // 🔹 Add a product to return list (avoid duplicates)
    SetReturnItemList: (state, action) => {
      const existingIndex = state.ReturnItemList.findIndex(
        item => item.ProductName === action.payload.ProductName
      );
      if (existingIndex === -1) {
        state.ReturnItemList.push(action.payload);
      } else {
        // Optional: update quantity if already exists
        state.ReturnItemList[existingIndex].Qty = action.payload.Qty;
      }
    },

    // 🔹 Remove product from return list by index
    RemoveReturnItem: (state, action) => {
      state.ReturnItemList.splice(action.payload, 1);
    },

    // 🔹 Clear the return form
    ClearReturnForm: (state) => {
      state.ReturnFormValue = {
        CustomerID: "",
        SlipNo: "",
        Reason: "",
        GivenDate: "",
      };
      state.ReturnItemList = [];
      state.ProductDropDown = [];
    }
  },
});

export const {
  SetReturnList,
  SetReturnListTotal,
  SetCustomerDropDown,
  SetProductDropDown,
  OnChangeReturnInput,
  SetReturnItemList,
  RemoveReturnItem,
  ClearReturnForm
} = returnSlice.actions;

export default returnSlice.reducer;
