import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // ================= ADMISSION SEASONS =================
  seasons: [],
  selectedSeason: null,

  // ================= APPLICATION LISTS =================
  supervisorApplications: [],

  chairmanApplications: {
    selected: [],
    waiting: []
  },

  deanApplications: [],

  // ================= TEMP LOGIN / ENROLLMENT =================
  tempLoginInfo: null,          // { applicationId, email, deadline }
  enrollmentResult: null,       // { studentId, registrationNumber }

  // ================= UI / STATUS =================
  loading: {
    apply: false,
    supervisorDecision: false,
    chairmanDecision: false,
    deanDecision: false,
    tempLogin: false,
    enrollment: false
  },

  error: null
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

    // ================= SUPERVISOR =================
    SetSupervisorApplications(state, action) {
      state.supervisorApplications = action.payload;
    },

    // ================= CHAIRMAN =================
    SetChairmanSelectedApplications(state, action) {
      state.chairmanApplications.selected = action.payload;
    },

    SetChairmanWaitingApplications(state, action) {
      state.chairmanApplications.waiting = action.payload;
    },

    ClearChairmanApplications(state) {
      state.chairmanApplications = { selected: [], waiting: [] };
    },

    // ================= DEAN =================
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

    // ================= ENROLLMENT =================
    SetEnrollmentResult(state, action) {
      state.enrollmentResult = action.payload;
    },

    ClearEnrollmentResult(state) {
      state.enrollmentResult = null;
    },

    // ================= LOADING =================
    SetAdmissionLoading(state, action) {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },

    // ================= ERROR =================
    SetAdmissionError(state, action) {
      state.error = action.payload;
    },

    ClearAdmissionError(state) {
      state.error = null;
    },

    // ================= RESET =================
    ClearAdmissionState() {
      return initialState;
    }
  }
});

export const {
  SetAdmissionSeasons,
  SetSelectedSeason,

  SetSupervisorApplications,

  SetChairmanSelectedApplications,
  SetChairmanWaitingApplications,
  ClearChairmanApplications,

  SetDeanApplications,

  SetTempLoginInfo,
  ClearTempLoginInfo,

  SetEnrollmentResult,
  ClearEnrollmentResult,

  SetAdmissionLoading,

  SetAdmissionError,
  ClearAdmissionError,

  ClearAdmissionState
} = admissionSlice.actions;

export default admissionSlice.reducer;
