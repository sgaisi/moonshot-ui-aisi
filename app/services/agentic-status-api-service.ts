import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  proxyPathAgenticGetStatus,
  proxyPathBenchmarksGetStatus,
} from './constants';
import { getHostAndPort } from './host';

const [host, port] = getHostAndPort();
const agenticStatusApi = createApi({
  reducerPath: 'agenticStatusApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${host}:${port}` }),
  endpoints: (builder) => ({
    getAgenticStatus: builder.query<TestStatuses, void>({
      // Use proper agentic endpoint - backend routing is confirmed and working
      query: () => proxyPathAgenticGetStatus,
      keepUnusedDataFor: 0,
    }),
  }),
});

const { useGetAgenticStatusQuery } = agenticStatusApi;

export { agenticStatusApi, useGetAgenticStatusQuery };
