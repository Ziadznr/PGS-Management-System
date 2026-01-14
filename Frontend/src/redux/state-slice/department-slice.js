// src/redux/state-slice/department-slice.js

import { createSlice } from "@reduxjs/toolkit";

export const departmentSlice = createSlice({
  name: "department",
  initialState: {
    List: [],
    ListTotal: 0,
    FormValue: {
      Name: ""
    }
  },
  reducers: {

    // Set department list
    SetDepartmentList: (state, action) => {
      state.List = action.payload;
    },

    // Set department total
    SetDepartmentListTotal: (state, action) => {
      state.ListTotal = action.payload;
    },

    // Handle input change
    OnChangeDepartmentInput: (state, action) => {
      state.FormValue[action.payload.Name] = action.payload.Value;
    },

    // Reset form
    ResetDepartmentFormValue: (state) => {
      state.FormValue.Name = "";
    }
  }
});

export const {
  SetDepartmentList,
  SetDepartmentListTotal,
  OnChangeDepartmentInput,
  ResetDepartmentFormValue
} = departmentSlice.actions;

export default departmentSlice.reducer;
