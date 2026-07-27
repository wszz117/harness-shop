import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { apiSlice } from '../slices/apiSlice.js';
import cartSliceReducer from '../slices/cartSlice.js';
import authReducer from '../slices/authSlice.js';
import fxReducer from '../slices/fxSlice.js';
import languageReducer from '../slices/languageSlice.js';

export function makeStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
      cart: cartSliceReducer,
      auth: authReducer,
      fx: fxReducer,
      language: languageReducer,
    },
    middleware: (gdm) => gdm().concat(apiSlice.middleware),
    preloadedState,
  });
}

export function renderWithProviders(ui, { preloadedState, store } = {}) {
  const s = store || makeStore(preloadedState);
  const result = render(
    <Provider store={s}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
  return { store: s, ...result };
}
