import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // 🔹 Admission Seasons
  seasons: [],
  selectedSeason: null,

  // 🔹 Applications by role
  supervisorApplications: [],
  chairmanApplications: [],
  deanApplications: [],

  // 🔹 Enrollment / temp access info
  tempLoginInfo: null,

  // 🔹 UI helpers
  isSubmitting: false
};

const admissionSlice = createSlice({
  name: "admission",
  initialState,
  reducers: {

    // ================= SEASON =================
    SetAdmissionSeasons(state, action) {
      state.seasons = action.payload;
    },

    SetSelectedSeason(state, action) {
      state.selectedSeason = action.payload;
    },

    // ================= APPLICATION LISTS =================
    SetSupervisorApplications(state, action) {
      state.supervisorApplications = action.payload;
    },

    SetChairmanApplications(state, action) {
      state.chairmanApplications = action.payload;
    },

    SetDeanApplications(state, action) {
      state.deanApplications = action.payload;
    },

    // ================= TEMP LOGIN =================
    SetTempLoginInfo(state, action) {
      state.tempLoginInfo = action.payload;
    },

    ClearTempLoginInfo(state) {
      state.tempLoginInfo = null;
    },

    // ================= UI =================
    SetAdmissionSubmitting(state, action) {
      state.isSubmitting = action.payload;
    },

    ClearAdmissionState() {
      return initialState;
    }
  }
});

export const {
  SetAdmissionSeasons,
  SetSelectedSeason,
  SetSupervisorApplications,
  SetChairmanApplications,
  SetDeanApplications,
  SetTempLoginInfo,
  ClearTempLoginInfo,
  SetAdmissionSubmitting,
  ClearAdmissionState
} = admissionSlice.actions;

export default admissionSlice.reducer;
