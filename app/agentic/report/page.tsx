import { notFound } from 'next/navigation';
import React from 'react';
import { AgenticReportViewer } from '@/app/agentic/report/components/agenticReportViewer';
import { AgenticCookbookCategoryLabels } from '@/app/agentic/report/types/agenticReportTypes';
import { CookbooksAgenticResult } from '@/app/agentic/report/types/agenticReportTypes';
import { MainSectionSurface } from '@/app/components/mainSectionSurface';
import { colors } from '@/app/customColors';
import {
  fetchCookbooks,
  fetchRecipes,
  fetchAgenticReport,
  fetchRunnerHeading,
} from '@/app/lib/fetchApis';
import { fetchEndpoints } from '@/app/lib/fetchApis/fetchEndpoint';
import { ApiResult } from '@/app/lib/http-requests';
export const dynamic = 'force-dynamic';

export default async function AgenticReportPage(props: {
  searchParams: { id: string };
}) {
  const fetchPromises = [
    fetchAgenticReport(props.searchParams.id),
    fetchRunnerHeading(props.searchParams.id),
    fetchCookbooks({ categories: ['agentic'], count: false }),
    fetchRecipes({ count: true }),
    fetchEndpoints(),
  ];
  const [
    reportResponse,
    runnerHeadingResponse,
    agenticCookbooksResponse,
    recipesResponse,
    endpointsResponse,
  ] = await Promise.all(fetchPromises);

  if ('message' in reportResponse) {
    if (reportResponse.message.includes('No results found')) {
      return notFound();
    } else {
      throw new Error(reportResponse.message);
    }
  }

  if ('message' in runnerHeadingResponse) {
    throw new Error(runnerHeadingResponse.message);
  }

  if ('message' in agenticCookbooksResponse) {
    throw new Error(agenticCookbooksResponse.message);
  }

  if ('message' in recipesResponse) {
    throw new Error(recipesResponse.message);
  }

  if ('message' in endpointsResponse) {
    throw new Error(endpointsResponse.message);
  }

  const agenticResult = (reportResponse as ApiResult<CookbooksAgenticResult>)
    .data;
  const runnerNameAndDescription = (
    runnerHeadingResponse as ApiResult<RunnerHeading>
  ).data;

  const cookbooksInReportResponse = await fetchCookbooks({
    ids: agenticResult.metadata.cookbooks,
  });

  if ('message' in cookbooksInReportResponse) {
    throw new Error(cookbooksInReportResponse.message);
  }

  const cookbooksInReport = (
    cookbooksInReportResponse as ApiResult<Cookbook[]>
  ).data.sort((a, b) => a.name.localeCompare(b.name));
  const cookbooksUnderAgentic = (
    agenticCookbooksResponse as ApiResult<Cookbook[]>
  ).data;
  const recipes = (recipesResponse as ApiResult<Recipe[]>).data;
  const endpointsInReport = (
    endpointsResponse as ApiResult<LLMEndpoint[]>
  ).data.filter((endpoint) =>
    agenticResult.metadata.endpoints.includes(endpoint.id)
  );

  const cookbookCategoryLabels: AgenticCookbookCategoryLabels =
    agenticResult.metadata.cookbooks.reduce((acc, cookbookId) => {
      if (!acc[cookbookId]) {
        acc[cookbookId] = [];
      }
      if (
        cookbooksUnderAgentic.some((cookbook) => cookbook.id === cookbookId)
      ) {
        acc[cookbookId].push('A'); // A for Agentic
      }

      return acc;
    }, {} as AgenticCookbookCategoryLabels);

  return (
    <MainSectionSurface
      closeLinkUrl="/agentic"
      height="100%"
      bgColor={colors.moongray['950']}>
      <AgenticReportViewer
        agenticResult={agenticResult}
        runnerNameAndDescription={runnerNameAndDescription}
        cookbookCategoryLabels={cookbookCategoryLabels}
        cookbooksInReport={cookbooksInReport}
        recipes={recipes}
        endpoints={endpointsInReport}
      />
    </MainSectionSurface>
  );
}
