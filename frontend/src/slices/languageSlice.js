import { createSlice } from '@reduxjs/toolkit';

// 语言优先级：会话内显式切换 > 用户级偏好(User.uiLanguage) > 访客级 localStorage > 默认 zh
const GUEST_KEY = 'uiLanguage';
const SESSION_KEY = 'uiLanguageSessionExplicit';

const getInitialLanguage = () => {
  const stored = localStorage.getItem(GUEST_KEY);
  return stored === 'en' ? 'en' : 'zh';
};

// 登录时的语言合流：本会话用户显式选过语言 → 保持会话语言，否则用用户偏好
export const resolveLoginUiLanguage = (sessionLang, userLang) => {
  const explicit = sessionStorage.getItem(SESSION_KEY) === '1';
  if (explicit) return sessionLang;
  if (userLang === 'en' || userLang === 'zh') return userLang;
  return sessionLang || 'zh';
};

const languageSlice = createSlice({
  name: 'language',
  initialState: { current: getInitialLanguage() },
  reducers: {
    setLanguage: (state, action) => {
      state.current = action.payload === 'en' ? 'en' : 'zh';
      localStorage.setItem(GUEST_KEY, state.current);
    },
    setLanguageExplicit: (state, action) => {
      state.current = action.payload === 'en' ? 'en' : 'zh';
      localStorage.setItem(GUEST_KEY, state.current);
      sessionStorage.setItem(SESSION_KEY, '1');
    },
  },
});

export const { setLanguage, setLanguageExplicit } = languageSlice.actions;
export const selectLanguage = (state) => state.language.current;
export default languageSlice.reducer;
