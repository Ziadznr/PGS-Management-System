import { createSlice } from "@reduxjs/toolkit";

export const profileSlice = createSlice({
    name: "profile",
    initialState: {
        value: {
            firstName: "Guest",
            photo: "defaultPhoto.png",
            email: "",
        },
    },
    reducers: {
        SetProfile: (state, action) => {
            state.value = action.payload;
        },
        ClearProfile: (state) => {
            state.value = {
                firstName: "Guest",
                photo: "defaultPhoto.png",
                email: "",
            };
        },
    },
});

export const { SetProfile, ClearProfile } = profileSlice.actions;
export default profileSlice.reducer;
