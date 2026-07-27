import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import Header from '../components/Header.jsx';
import { renderWithProviders } from './testUtils.jsx';

describe('Header 语言切换 (I18N-R-001 全站即时生效)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('默认中文导航文案', () => {
    renderWithProviders(<Header />);
    expect(screen.getByTestId('nav-cart').textContent).toContain('购物车');
  });

  it('点击语言切换按钮后导航变英文，且标记会话显式选择', () => {
    renderWithProviders(<Header />);
    fireEvent.click(screen.getByTestId('lang-switch'));
    expect(screen.getByTestId('nav-cart').textContent).toContain('Cart');
    expect(sessionStorage.getItem('uiLanguageSessionExplicit')).toBe('1');
  });

  it('登录用户可见我的收藏入口 (WISH-R-001)', () => {
    renderWithProviders(<Header />, {
      preloadedState: {
        auth: { userInfo: { name: 'U', isAdmin: false } },
      },
    });
    expect(screen.getByTestId('nav-wishlist')).toBeInTheDocument();
  });
});
