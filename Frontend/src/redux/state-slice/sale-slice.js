import { createSlice } from "@reduxjs/toolkit";

export const saleSlice = createSlice({
  name: 'sale',
  initialState: {
    List: [],                   // All sales list
    ListTotal: 0,               // Total count of sales
    CustomerDropDown: [],       // Customer dropdown options
    ProductDropDown: [],        // Product dropdown options
    SaleFormValue: {
      CustomerID: '',           // Hidden from UI, used internally
      SlipNo: '',               // 🔹 New slip number field
      OtherCost: '',            // Additional cost
      GrandTotal: '',           // Calculated total
      Note: ''                  // Optional note
    },
    SaleItemList: []            // Items added to cart
  },
  reducers: {
    SetSaleList: (state, action) => {
      state.List = action.payload;
    },
    SetSaleListTotal: (state, action) => {
      state.ListTotal = action.payload;
    },
    SetCustomerDropDown: (state, action) => {
      state.CustomerDropDown = action.payload;
    },
    SetProductDropDown: (state, action) => {
      state.ProductDropDown = action.payload;
    },
    OnChangeSaleInput: (state, action) => {
      // Update a field in SaleFormValue dynamically
      const { Name, Value } = action.payload;
      state.SaleFormValue[Name] = Value;
    },
    SetSaleItemList: (state, action) => {
      // Add a product to the cart
      state.SaleItemList.push(action.payload);
    },
    RemoveSaleItem: (state, action) => {
      // Remove a product from the cart by index
      state.SaleItemList.splice(action.payload, 1);
    },
    ClearSaleForm: (state) => {
      // Optional: reset sale form values
      state.SaleFormValue = { CustomerID: '', SlipNo: '', OtherCost: '', GrandTotal: '', Note: '' };
      state.SaleItemList = [];
    },
    SetSlipNo: (state, action) => {
      // 🔹 Update slip number manually if needed
      state.SaleFormValue.SlipNo = action.payload;
    }
  }
});

// Export actions for use in components
export const {
  RemoveSaleItem,
  SetSaleList,
  SetProductDropDown,
  SetSaleItemList,
  SetCustomerDropDown,
  SetSaleListTotal,
  OnChangeSaleInput,
  ClearSaleForm,
  SetSlipNo
} = saleSlice.actions;

export default saleSlice.reducer;
