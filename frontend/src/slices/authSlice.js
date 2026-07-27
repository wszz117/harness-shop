import { createSlice, createListenerMiddleware } from '@reduxjs/toolkit';
import { clearAccountScopedApiCache } from './apiSlice.js';
import { setLanguage, resolveLoginUiLanguage } from './languageSlice.js';

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

// listener: 登录/登出联动 —— 账号级缓存清理 + 语言偏好合流
export const authListenerMiddleware = createListenerMiddleware();

authListenerMiddleware.startListening({
  actionCreator: logout,
  effect: async (action, api) => {
    clearAccountScopedApiCache(api.dispatch);
    // 登出后保持当前会话语言，不做覆盖 (specs/i18n.md)
  },
});

authListenerMiddleware.startListening({
  actionCreator: setCredentials,
  effect: async (action, api) => {
    clearAccountScopedApiCache(api.dispatch);
    // 登录不得直接覆盖访客语言：会话语言优先
    // (memory: 2026-05-19__frontend__login-overwrites-guest-uiLanguage)
    const resolved = resolveLoginUiLanguage(
      api.getState().language.current,
      action.payload?.uiLanguage
    );
    if (resolved !== api.getState().language.current) {
      api.dispatch(setLanguage(resolved));
    }
  },
});

export default authSlice.reducer;
