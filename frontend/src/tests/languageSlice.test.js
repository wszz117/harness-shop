import { describe, it, expect, beforeEach } from 'vitest';
import languageReducer, {
  setLanguage,
  setLanguageExplicit,
  resolveLoginUiLanguage,
} from '../slices/languageSlice.js';

describe('languageSlice', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('默认语言为 zh (I18N-R-001)', () => {
    const state = languageReducer(undefined, { type: '@@INIT' });
    expect(state.current).toBe('zh');
  });

  it('setLanguage 持久化到 localStorage (访客级)', () => {
    const state = languageReducer(undefined, setLanguage('en'));
    expect(state.current).toBe('en');
    expect(localStorage.getItem('uiLanguage')).toBe('en');
  });

  it('登录合流：会话显式选择优先于用户偏好 (memory: login-overwrites-guest-uiLanguage)', () => {
    sessionStorage.setItem('uiLanguageSessionExplicit', '1');
    expect(resolveLoginUiLanguage('en', 'zh')).toBe('en');
  });

  it('登录合流：无会话显式选择时用用户级偏好', () => {
    expect(resolveLoginUiLanguage('zh', 'en')).toBe('en');
  });

  it('登录合流：用户无偏好时保持会话语言', () => {
    expect(resolveLoginUiLanguage('en', undefined)).toBe('en');
  });
});
