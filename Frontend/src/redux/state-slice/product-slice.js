import { createSlice } from "@reduxjs/toolkit";

export const productSlice = createSlice({
    name: 'product',
    initialState: {
        List: [],
        ListTotal: 0,
        ProductCategoryDropDown: [],
        ProductBrandDropDown: [],
        FormValue: {
            CategoryID: "",
            BrandID: "",
            Name: "",
            Details: "",
            Stock: 0   // ✅ optional, to store/display stock in form
        }
    },
    reducers: {
        SetProductList: (state, action) => {
            state.List = action.payload;
        },
        SetProductListTotal: (state, action) => {
            state.ListTotal = action.payload;
        },
        SetProductBrandDropDown: (state, action) => {
            state.ProductBrandDropDown = action.payload;
        },
        SetProductCategoryDropDown: (state, action) => {
            state.ProductCategoryDropDown = action.payload;
        },
        OnChangeProductInput: (state, action) => {
            state.FormValue[`${action.payload.Name}`] = action.payload.Value;
        },
        ResetProductFormValue: (state, action) => {
            Object.keys(state.FormValue).forEach((i) => {
                if (i === "Stock") {
                    state.FormValue[i] = 0; // reset stock to 0
                } else {
                    state.FormValue[i] = "";
                }
            });
        }
    }
});

export const {
    SetProductList,
    SetProductListTotal,
    SetProductBrandDropDown,
    SetProductCategoryDropDown,
    OnChangeProductInput,
    ResetProductFormValue
} = productSlice.actions;

export default productSlice.reducer;
