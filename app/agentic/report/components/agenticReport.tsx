import React from 'react';
import { CookbooksAgenticResult } from '@/app/agentic/report/types/agenticReportTypes';
import { AgenticCookbookCategoryLabels } from '@/app/agentic/report/types/agenticReportTypes';
import { Button, ButtonType } from '@/app/components/button';
import { AgenticCookbookReportCard } from './agenticCookbookReportCard';
import { AgenticRecipeRatingResult } from './agenticRecipeRatingResult';
import { AgenticReportHeading } from './agenticReportHeading';
import { AgenticRunSummary } from './agenticRunSummary';
import { AgenticCapabilitiesOverview } from './agenticCapabilitiesOverview';

type AgenticReportProps = {
  agenticResult: CookbooksAgenticResult;
  endpointId: string;
  endpointName: string;
  runnerNameAndDescription: RunnerHeading;
  cookbooksInReport: Cookbook[];
  cookbookCategoryLabels: AgenticCookbookCategoryLabels;
  recipes: Recipe[];
  expanded?: boolean;
};

function calcTotalAgenticPromptsByEndpoint(
  agenticResult: CookbooksAgenticResult,
  endpointId: string
): number {
  return agenticResult.results.cookbooks.reduce((total, cookbook) => {
    const endpointSummary = cookbook.overall_evaluation_summary.find(
      (summary) => summary.model_id === endpointId
    );
    return total + (endpointSummary ? cookbook.total_num_of_prompts : 0);
  }, 0);
}

const AgenticReport = React.forwardRef<HTMLDivElement, AgenticReportProps>(
  (props, ref) => {
    const {
      agenticResult,
      runnerNameAndDescription,
      endpointId,
      endpointName,
      cookbooksInReport,
      cookbookCategoryLabels,
      recipes,
      expanded = false,
    } = props;

    const downloadUrl = `/api/v1/agentic/results/${agenticResult.metadata.id}?download=true`;
    const totalPrompts = React.useMemo(
      () => calcTotalAgenticPromptsByEndpoint(agenticResult, endpointId),
      [agenticResult.metadata.id, endpointId]
    );

    const cookbookResults = agenticResult.results.cookbooks;

    // Collect all agentic capabilities across cookbooks
    const allAgenticCapabilities = React.useMemo(() => {
      const capabilities = new Set<string>();
      cookbookResults.forEach((cookbook) => {
        cookbook.agentic_capabilities?.forEach((capability) =>
          capabilities.add(capability)
        );
      });
      return Array.from(capabilities);
    }, [cookbookResults]);

    return (
      <div
        className="flex-1 h-full border border-white
        rounded-lg overflow-hidden pr-[2px] py-[2px] max-w-[1120px]">
        <div
          ref={ref}
          id="agentic-report-content"
          className="h-full overflow-x-hidden custom-scrollbar">
          <article className="flex flex-col gap-8 bg-moongray-800">
            <AgenticReportHeading
              runnerNameAndDescription={runnerNameAndDescription}
            />
            <AgenticRunSummary
              cookbooksInReport={cookbooksInReport}
              cookbookCategoryLabels={cookbookCategoryLabels}
              endpointName={endpointName}
              totalPrompts={totalPrompts}
              startTime={agenticResult.metadata.start_time}
              endTime={agenticResult.metadata.end_time}
            />
            <AgenticCapabilitiesOverview
              capabilities={allAgenticCapabilities}
              agenticResult={agenticResult}
              endpointId={endpointId}
            />

            <section className="px-6">
              <h2 className="text-white text-xl font-semibold mb-4">
                Agentic Test Results
              </h2>
              <p className="text-moongray-300 text-sm mb-6">
                This report summarizes the results for the agentic tests run on
                the endpoint. Results include tool usage success rates,
                reasoning quality, task completion rates, and demonstrated
                agentic capabilities.
              </p>
            </section>

            <section
              className="h-full w-full text-moongray-300 text-[0.9rem]
                bg-moongray-800 rounded-lg px-6 flex flex-col gap-4">
              {cookbooksInReport.map((cookbook) => {
                const cookbookResult = cookbookResults.find(
                  (result) => result.id === cookbook.id
                );
                return cookbookResult ? (
                  <AgenticCookbookReportCard
                    key={cookbook.id}
                    result={cookbookResult}
                    cookbook={cookbook}
                    endpointId={endpointId}
                    expanded={expanded}>
                    {cookbookResult.recipes.map((recipeResult, i) => {
                      const recipe = recipes.find(
                        (recipe) => recipe.id === recipeResult.id
                      );
                      return recipe ? (
                        <React.Fragment key={recipeResult.id}>
                          {i > 0 && i % 2 === 0 && (
                            <div className="break-before-page h-[40px]" />
                          )}
                          <AgenticRecipeRatingResult
                            result={recipeResult}
                            recipe={recipe}
                            endpointId={endpointId}
                          />
                        </React.Fragment>
                      ) : (
                        <div key={recipeResult.id}>
                          No recipe details for {recipeResult.id}
                        </div>
                      );
                    })}
                  </AgenticCookbookReportCard>
                ) : null;
              })}
            </section>

            <footer className="flex justify-center pb-10">
              <a
                data-download="hide"
                href={downloadUrl}
                download>
                <Button
                  mode={ButtonType.OUTLINE}
                  size="lg"
                  text="Download Detailed Agentic Results JSON"
                  hoverBtnColor="#524e56"
                />
              </a>
            </footer>
          </article>
        </div>
      </div>
    );
  }
);

AgenticReport.displayName = 'AgenticReport';

export { AgenticReport };
