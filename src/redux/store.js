import { configureStore } from '@reduxjs/toolkit'
import tagsReducer from './tagsSlice'
import loginReducer from './loginSlice'

export default configureStore({
  reducer: {
    tags: tagsReducer,
    login: loginReducer,
  },
})