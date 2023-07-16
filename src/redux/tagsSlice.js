import { createSlice } from '@reduxjs/toolkit'

export const tagsSlice = createSlice({
  name: 'tags',
  initialState: {
    tags: [],
  },
  reducers: {
    addTag: (state, action) => {
      console.log(action.type);
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      if(action.type === "tags/addTag") state.tags = state.tags.concat([action.payload])
    },
    setTags: (state, action) => {
      console.log(action.type);
      if(action.type === "tags/setTags")
        state.tags = action.payload;
    },
    rmTag: (state, action) => {
      console.log(action.type);
      if(action.type === "tags/rmTag")
        state.tags = state.tags.filter((t) => t !== action.payload)
    },
    clearTags: (action, state) => {
      console.log(action.type);
      if(action.type === "tags/clearTags")
        state.tags = []
    },
  },
})

// Action creators are generated for each case reducer function
export const { addTag, rmTag, clearTags,setTags } = tagsSlice.actions

export default tagsSlice.reducer