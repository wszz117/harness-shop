import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './slices/apiSlice.js';
import cartSliceReducer from './slices/cartSlice.js';
import authReducer, { authListenerMiddleware } from './slices/authSlice.js';
import fxReducer from './slices/fxSlice.js';
import languageReducer from './slices/languageSlice.js';

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    cart: cartSliceReducer,
    auth: authReducer,
    fx: fxReducer,
    language: languageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .prepend(authListenerMiddleware.middleware),
  devTools: true,
});

export default store;
