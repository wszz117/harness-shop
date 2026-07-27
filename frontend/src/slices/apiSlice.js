import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '',
  prepareHeaders: (headers, { getState }) => {
    // 语言随请求头下发，后端 productI18n.resolveLang 消费
    const lang = getState().language?.current;
    if (lang) headers.set('x-ui-language', lang);
    return headers;
  },
});

// 唯一的 API 通道 —— 所有 API 调用必须通过 RTK Query injectEndpoints (code-standards.mdc)
export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['Product', 'Order', 'User', 'Wishlist'],
  endpoints: (builder) => ({}),
});

// 登出/换号时清空账号级缓存，防止收藏/订单面板残留
// (memory: 2026-05-19__frontend__rtk-account-cache-on-auth-switch)
export const clearAccountScopedApiCache = (dispatch) => {
  dispatch(apiSlice.util.resetApiState());
};
