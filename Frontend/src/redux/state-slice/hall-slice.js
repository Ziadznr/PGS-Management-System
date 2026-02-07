import { createSlice } from "@reduxjs/toolkit";

const HallSlice = createSlice({
  name: "hall",

  initialState: {
    List: [],
    ListTotal: 0,

    FormValue: {
      name: "",
      code: "",
      description: ""
    }
  },

  reducers: {
    /* ================= LIST ================= */
    SetHallList(state, action) {
      state.List = action.payload;
    },

    SetHallListTotal(state, action) {
      state.ListTotal = action.payload;
    },

    /* ================= FORM ================= */
    OnChangeHallInput(state, action) {
      const { Name, Value } = action.payload;
      state.FormValue[Name] = Value;
    },

    ResetHallFormValue(state) {
      state.FormValue = {
        name: "",
        code: "",
        description: ""
      };
    }
  }
});

/* ================= EXPORT ================= */
export const {
  SetHallList,
  SetHallListTotal,
  OnChangeHallInput,
  ResetHallFormValue
} = HallSlice.actions;

export default HallSlice.reducer;
