import { apiSlice } from './apiSlice.js';

const PRODUCTS_URL = '/api/products';

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ keyword, pageNumber, lang } = {}) => ({
        url: PRODUCTS_URL,
        params: { keyword, pageNumber, lang },
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Product'],
    }),
    getProductDetails: builder.query({
      query: ({ productId, lang } = {}) => ({
        url: `${PRODUCTS_URL}/${productId}`,
        params: { lang },
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Product'],
    }),
    getTopProducts: builder.query({
      query: ({ lang } = {}) => ({ url: `${PRODUCTS_URL}/top`, params: { lang } }),
      keepUnusedDataFor: 5,
    }),
    createProduct: builder.mutation({
      query: () => ({ url: PRODUCTS_URL, method: 'POST' }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: (data) => ({
        url: `${PRODUCTS_URL}/${data.productId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    createReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCTS_URL}/${data.productId}/reviews`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useGetTopProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateReviewMutation,
} = productsApiSlice;
