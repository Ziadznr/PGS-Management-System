// src/redux/state-slice/section-slice.js
import { createSlice } from "@reduxjs/toolkit";

export const sectionSlice = createSlice({
    name: 'section',
    initialState: {
        List: [],           // Full section list
        ListTotal: 0,       // Total sections (for pagination)
        DropDown: [],       // For dropdown
        FormValue: {
            Name: ""        // Section name only
        }
    },
    reducers: {
        // Set full section list
        SetSectionList: (state, action) => {
            state.List = action.payload;
        },

        // Set total sections for pagination
        SetSectionListTotal: (state, action) => {
            state.ListTotal = action.payload;
        },

        // Set section dropdown
        SetSectionDropDown: (state, action) => {
            state.DropDown = action.payload;
        },

        // Update form input dynamically
        OnChangeSectionInput: (state, action) => {
            state.FormValue[`${action.payload.Name}`] = action.payload.Value;
        },

        // Reset form values
        ResetSectionFormValue: (state) => {
            Object.keys(state.FormValue).forEach((i) => state.FormValue[i] = "");
        }
    }
});

// Export actions
export const {
    SetSectionList,
    SetSectionListTotal,
    SetSectionDropDown,
    OnChangeSectionInput,
    ResetSectionFormValue
} = sectionSlice.actions;

// Export reducer
export default sectionSlice.reducer;
