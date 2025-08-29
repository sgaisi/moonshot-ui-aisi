import { RunnerDetailWebApiModel, RunnerWebApiModel } from '@/app/api/types';
import { RunsView } from '@/app/components/runsView';
import { agenticRunsViewConfig } from '@/app/config/testingConfigs';
import { ErrorWithMessage, toErrorWithMessage } from '@/app/lib/error-utils';
import { ApiResult, processResponse } from '@/app/lib/http-requests';
import config from '@/moonshot.config';
export const dynamic = 'force-dynamic';

async function fetchAgenticRuns(): Promise<
  ApiResult<Runner[]> | ErrorWithMessage
> {
  const response = await fetch(
    `${config.webAPI.hostURL}${config.webAPI.basePathRunners}`,
    { cache: 'no-store' }
  );
  const result: ApiResult<RunnerWebApiModel[]> | ErrorWithMessage =
    await processResponse<RunnerWebApiModel[]>(response);
  if ('message' in result) {
    return result;
  }
  const runners = result.data;
  const runnerPromises = runners.map(async (runner) => {
    try {
      const runnerDetailsResponse = await fetch(
        `${config.webAPI.hostURL}${config.webAPI.basePathRunners}/${runner.id}/runs/1`
      );
      const result = await processResponse<RunnerDetailWebApiModel>(
        runnerDetailsResponse
      );
      if ('message' in result) {
        return result;
      }
      return {
        ...runner,
        ...result.data,
        database_file: undefined,
      };
    } catch (error) {
      return toErrorWithMessage(error);
    }
  });

  try {
    const mergedRunners = await Promise.all(runnerPromises);
    const filteredCookbookAgenticRunners = mergedRunners.filter(
      (response) =>
        'runner_args' in response &&
        response.runner_args.runner_processing_module == 'agentic' &&
        'cookbooks' in response.runner_args
    );
    return { status: 200, data: filteredCookbookAgenticRunners as Runner[] };
  } catch (error) {
    const errorWithMsg = toErrorWithMessage(error);
    return errorWithMsg;
  }
}

async function fetchAgenticResultIds(): Promise<
  ApiResult<string[]> | ErrorWithMessage
> {
  try {
    const response = await fetch(
      `${config.webAPI.hostURL}${config.webAPI.basePathAgentic}/results/name`,
      { cache: 'no-store' }
    );

    // If endpoint doesn't exist (404), return empty array
    if (response.status === 404) {
      console.warn('Agentic results endpoint not yet implemented');
      return { status: 200, data: [] };
    }

    const result = await processResponse<string[]>(response);
    if ('message' in result) {
      return result;
    }
    return result;
  } catch (error) {
    // If agentic results endpoint doesn't exist yet, return empty array
    console.warn('Agentic results endpoint not yet implemented:', error);
    return { status: 200, data: [] };
  }
}

export default async function AgenticRunsPage() {
  const result = await fetchAgenticRuns();
  if ('message' in result) {
    throw result.message;
  }

  const idsResult = await fetchAgenticResultIds();
  if ('message' in idsResult) {
    throw idsResult.message;
  }

  return (
    <RunsView
      {...agenticRunsViewConfig}
      runners={result.data}
      resultIds={idsResult.data}
    />
  );
}
