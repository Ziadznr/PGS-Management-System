import { createSlice } from "@reduxjs/toolkit";
import { getToken, getUserDetails } from "../../helper/SessionHelper";

/* ================= PERSISTED DATA ================= */
const persistedToken = getToken();
const persistedUser = getUserDetails();

/* ================= INITIAL STATE ================= */
const initialState = {
  isAuthenticated: !!persistedToken,
  token: persistedToken || null,

  user: persistedUser
    ? {
        id: persistedUser._id || persistedUser.id || null,
        name:
          persistedUser.name ||
          `${persistedUser.firstName || ""} ${persistedUser.lastName || ""}`.trim(),
        nameExtension: persistedUser.nameExtension || "",
        email: persistedUser.email || "",
        role: persistedUser.role || "",
        department: persistedUser.department || null,
        photo: persistedUser.photo || ""
      }
    : {
        id: null,
        name: "",
        nameExtension: "",
        email: "",
        role: "",
        department: null,
        photo: ""
      }
};

/* ================= SLICE ================= */
export const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    /* ================= LOGIN / PROFILE LOAD ================= */
    SetUserProfile: (state, action) => {
      const { token, user } = action.payload;

      state.isAuthenticated = !!token;
      state.token = token || null;

      state.user = {
        id: user?._id || user?.id || null,
        name:
          user?.name ||
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        nameExtension: user?.nameExtension || "",  
        email: user?.email || "",
        role: user?.role || "",
        department: user?.department || null,
        photo: user?.photo || ""
      };
    },

    /* ================= LOGOUT ================= */
    ClearUserProfile: () => ({
      isAuthenticated: false,
      token: null,
      user: {
        id: null,
        name: "",
        nameExtension: "",
        email: "",
        role: "",
        department: null,
        photo: ""
      }
    })
  }
});

export const { SetUserProfile, ClearUserProfile } = userProfileSlice.actions;
export default userProfileSlice.reducer;
