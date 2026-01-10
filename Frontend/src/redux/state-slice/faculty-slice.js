// src/redux/state-slice/faculty-slice.js
import { createSlice } from "@reduxjs/toolkit";

export const facultySlice = createSlice({
    name: 'faculty',
    initialState: {
        List: [],
        ListTotal: 0,
        DropDown: [],   // <-- for dropdown
        FormValue: {
            Name: ""
        }
    },
    reducers: {
        SetFacultyList: (state, action) => {
            state.List = action.payload;
        },
        SetFacultyListTotal: (state, action) => {
            state.ListTotal = action.payload;
        },
        SetFacultyDropDown: (state, action) => {   // <-- new reducer
            state.DropDown = action.payload;
        },
        OnChangeFacultyInput: (state, action) => {
            state.FormValue[`${action.payload.Name}`] = action.payload.Value;
        },
        ResetFacultyFormValue: (state) => {
            Object.keys(state.FormValue).forEach((i) => state.FormValue[i] = "");
        }
    }
});

export const {
    SetFacultyList,
    SetFacultyListTotal,
    SetFacultyDropDown,    // <-- export new action
    OnChangeFacultyInput,
    ResetFacultyFormValue
} = facultySlice.actions;

export default facultySlice.reducer;
