import { notFound } from 'next/navigation';
import React from 'react';
import { AgenticRunStatus } from '@/app/agentic/components/agenticRunStatus';
import { ErrorWithMessage } from '@/app/lib/error-utils';
import { ApiResult, processResponse } from '@/app/lib/http-requests';
import config from '@/moonshot.config';
export const dynamic = 'force-dynamic';

async function fetchStatus(): Promise<
  ApiResult<TestStatuses> | ErrorWithMessage
> {
  const response = await fetch(
    `${config.webAPI.hostURL}${config.webAPI.basePathAgentic}/status`,
    { cache: 'no-store' }
  );

  const result = processResponse<TestStatuses>(response);
  if ('error' in result) {
    return result as Promise<ErrorWithMessage>;
  }

  return result as Promise<ApiResult<TestStatuses>>;
}

export default async function AgenticRunPage() {
  const allStatus = await fetchStatus();
  if ('error' in allStatus) {
    notFound();
  }
  return (
    <AgenticRunStatus
      allStatuses={(allStatus as ApiResult<TestStatuses>).data}
    />
  );
}
