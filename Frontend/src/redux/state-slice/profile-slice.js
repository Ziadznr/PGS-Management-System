import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    photo: "defaultPhoto.png",
    role: "admin"   // fixed for admin panel
  }
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    SetProfile: (state, action) => {
      state.value = {
        ...state.value,
        ...action.payload
      };
    },
    ClearProfile: (state) => {
      state.value = initialState.value;
    }
  }
});

export const { SetProfile, ClearProfile } = profileSlice.actions;
export default profileSlice.reducer;
