import { createSlice } from "@reduxjs/toolkit";

export const dashboardSlice=createSlice({
    name:'dashboard',
    initialState:{
        ExpenseChart:[],
        PurchaseChart:[],
        ReturnChart:[],
        SaleChart:[],
        ExpenseTotal:0,
        SaleTotal:0,
        PurchaseTotal:0,
        ReturnTotal:0
    },
    reducers:{
        SetExpenseChart:(state,action)=>{
            state.ExpenseChart=action.payload
        },
        SetSaleChart:(state,action)=>{
            state.SaleChart=action.payload
        },
        SetReturnChart:(state,action)=>{
            state.ReturnChart=action.payload
        },
        SetPurchaseChart:(state,action)=>{
            state.PurchaseChart=action.payload
        },
        SetExpenseTotal:(state,action)=>{
            state.ExpenseTotal=action.payload
        },
        SetPurchaseTotal:(state,action)=>{
            state.PurchaseTotal=action.payload
        },
        SetSaleTotal:(state,action)=>{
            state.SaleTotal=action.payload
        },
        SetReturnTotal:(state,action)=>{
            state.ReturnTotal=action.payload
        }
    }
})

export const {SetExpenseChart,SetSaleChart,SetPurchaseChart,SetReturnChart,SetExpenseTotal,SetPurchaseTotal,SetReturnTotal,SetSaleTotal}=dashboardSlice.actions;
export default dashboardSlice.reducer;