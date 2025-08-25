import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { proxyPathAgenticExec } from './constants';
import { getHostAndPort } from './host';

const [host, port] = getHostAndPort();

const agenticRunApi = createApi({
  reducerPath: 'agenticRunApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${host}:${port}` }),
  endpoints: (builder) => ({
    cancelAgentic: builder.mutation<void, string>({
      query: (runnerId) => ({
        url: `${proxyPathAgenticExec}/cancel/${runnerId}`,
        method: 'POST',
      }),
    }),
  }),
});

const { useCancelAgenticMutation } = agenticRunApi;

export { agenticRunApi, useCancelAgenticMutation };
