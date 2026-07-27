import '@testing-library/jest-dom';

// jsdom 缺失的 matchMedia 兜底
if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  });
}
