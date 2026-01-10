// src/redux/state-slice/department-slice.js
import { createSlice } from "@reduxjs/toolkit";

export const departmentSlice = createSlice({
    name: 'department',
    initialState: {
        List: [],           // Stores department list
        ListTotal: 0,       // Total departments (for pagination)
        FormValue: {
            Name: "",       // Department Name
            FacultyID: ""   // Linked Faculty ID
        }
    },
    reducers: {
        // Set department list
        SetDepartmentList: (state, action) => {
            state.List = action.payload;
        },

        // Set total department count
        SetDepartmentListTotal: (state, action) => {
            state.ListTotal = action.payload;
        },

        // Update form inputs dynamically
        OnChangeDepartmentInput: (state, action) => {
            state.FormValue[`${action.payload.Name}`] = action.payload.Value;
        },

        // Reset form values
        ResetDepartmentFormValue: (state) => {
            Object.keys(state.FormValue).forEach((i) => state.FormValue[i] = "");
        }
    }
});

// Export actions
export const {
    SetDepartmentList,
    SetDepartmentListTotal,
    OnChangeDepartmentInput,
    ResetDepartmentFormValue
} = departmentSlice.actions;

// Export reducer
export default departmentSlice.reducer;
