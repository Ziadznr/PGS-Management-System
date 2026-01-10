import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  applications: [],
  currentApplication: null
};

const admissionSlice = createSlice({
  name: "admission",
  initialState,
  reducers: {
    SetApplications(state, action) {
      state.applications = action.payload;
    },

    SetCurrentApplication(state, action) {
      state.currentApplication = action.payload;
    },

    ClearAdmissionState() {
      return initialState;
    }
  }
});

export const {
  SetApplications,
  SetCurrentApplication,
  ClearAdmissionState
} = admissionSlice.actions;

export default admissionSlice.reducer;
