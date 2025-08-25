import { CookbooksAgenticResult } from '@/app/agentic/report/types/agenticReportTypes';
import { ErrorWithMessage } from '@/app/lib/error-utils';
import { ApiResult, processResponse } from '@/app/lib/http-requests';
import config from '@/moonshot.config';

export async function fetchAgenticReport(
  id: string
): Promise<ApiResult<CookbooksAgenticResult> | ErrorWithMessage> {
  const response = await fetch(
    `${config.webAPI.hostURL}${config.webAPI.basePathAgentic}/results/${id}`,
    {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
    }
  );

  const result = await processResponse<CookbooksAgenticResult>(response);
  if ('message' in result) {
    return result as ErrorWithMessage;
  }
  return result as ApiResult<CookbooksAgenticResult>;
}
