import { createSlice } from "@reduxjs/toolkit";
import { getToken, getUserDetails } from "../../helper/SessionHelper";

// ================= INITIAL STATE =================
const persistedToken = getToken();
const persistedUser = getUserDetails();

const initialState = {
    isAuthenticated: !!persistedToken,
    token: persistedToken || null,

    user: persistedUser
        ? {
            id: persistedUser._id || persistedUser.id || null,
            name:
                persistedUser.name ||
                `${persistedUser.firstName || ""} ${persistedUser.lastName || ""}`.trim(),
            email: persistedUser.email || "",
            role: persistedUser.role || "",
            faculty: persistedUser.faculty || null,
            department: persistedUser.department || null,
            photo: persistedUser.photo || "defaultPhoto.png"
        }
        : {
            id: null,
            name: "",
            email: "",
            role: "",
            faculty: null,
            department: null,
            photo: "defaultPhoto.png"
        }
};

// ================= SLICE =================
export const userProfileSlice = createSlice({
    name: "userProfile",
    initialState,
    reducers: {

        // LOGIN / PROFILE LOAD
        SetUserProfile: (state, action) => {
  const { token, user } = action.payload;

  state.isAuthenticated = !!token;
  state.token = token;

  state.user = {
    id: user?._id || user?.id || null,
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
    faculty: user?.faculty || null,
    department: user?.department || null,
    photo: user?.photo || "defaultPhoto.png"
  };
}
,

        // LOGOUT
        ClearUserProfile: () => ({
            isAuthenticated: false,
            token: null,
            user: {
                id: null,
                name: "",
                email: "",
                role: "",
                faculty: null,
                department: null,
                photo: "defaultPhoto.png"
            }
        })
    }
});

export const {
    SetUserProfile,
    ClearUserProfile
} = userProfileSlice.actions;

export default userProfileSlice.reducer;
