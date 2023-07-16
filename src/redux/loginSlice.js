import { createSlice } from '@reduxjs/toolkit'

export const loginSlice = createSlice({
  name: 'login',
  initialState: {
    openMenu: false,
  },
  reducers: {
    toggleLoginDialog: (state, action) => {
      console.log("1: " + action.type);
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      if(action.type === "login/toggleLoginDialog")
        state.openMenu = !state.openMenu
    },
    openLoginDialog: (state) => {
        state.openMenu = true;
    },
    closeLoginDialog: (state) => {
        state.openMenu = false;
    }
  },
})

// Action creators are generated for each case reducer function
export const { toggleLoginDialog, openLoginDialog, closeLoginDialog } = loginSlice.actions

export default loginSlice.reducer