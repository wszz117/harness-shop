import { apiSlice } from './apiSlice.js';

const ORDERS_URL = '/api/orders';

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({ url: ORDERS_URL, method: 'POST', body: order }),
    }),
    getOrderDetails: builder.query({
      query: (id) => ({ url: `${ORDERS_URL}/${id}` }),
      keepUnusedDataFor: 5,
    }),
    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: 'PUT',
        body: details,
      }),
    }),
    getMyOrders: builder.query({
      query: () => ({ url: `${ORDERS_URL}/mine` }),
      keepUnusedDataFor: 5,
      providesTags: ['Order'],
    }),
    getOrders: builder.query({
      query: () => ({ url: ORDERS_URL }),
      keepUnusedDataFor: 5,
      providesTags: ['Order'],
    }),
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useDeliverOrderMutation,
} = ordersApiSlice;
