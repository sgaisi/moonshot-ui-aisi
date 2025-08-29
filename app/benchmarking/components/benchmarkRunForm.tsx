import React from 'react';
import { RunForm } from '@/app/components/runForm';
import { benchmarkRunFormConfig } from '@/app/config/testingConfigs';
import { getRecipesStatsById } from '@/actions/getRecipesStatsById';

type BenchmarkRunFormProps = {
  selectedCookbooks: Cookbook[];
  selectedEndpoints: LLMEndpoint[];
};

function BenchmarkRunForm({
  selectedCookbooks,
  selectedEndpoints,
}: BenchmarkRunFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const [recipesStats, setRecipesStats] = React.useState<RecipeStats[]>([]);

  React.useEffect(() => {
    startTransition(() => {
      getRecipesStatsById(
        selectedCookbooks.reduce((allRecipes, cookbook) => {
          allRecipes.push(...cookbook.recipes);
          return allRecipes;
        }, [] as string[])
      ).then((result) => {
        if (result.status === 'error') {
          console.log(result.message);
          setRecipesStats([]);
        } else {
          setRecipesStats(result.data);
        }
      });
    });
  }, [selectedCookbooks]);

  // Component to display benchmark-specific prompt calculations
  function BenchmarkPromptDisplay({
    recipesStats,
    isPending,
    percentageOfPrompts,
    isRunAll: _isRunAll,
  }: {
    recipesStats: RecipeStats[];
    isPending: boolean;
    percentageOfPrompts: number;
    isRunAll: boolean;
  }) {
    // Now using dynamic percentage from parent RunForm slider!
    const decimalFraction = percentageOfPrompts / 100;
    const calcPercentageAtEachDataset = true;

    const [numOfPromptsGrandTotal, userInputNumOfPromptsGrandTotal] =
      React.useMemo(() => {
        return recipesStats.reduce(
          (acc, stats) => {
            let percentageCalculatedTotalPrompts = 0;
            const totalPromptsFromAllDatasets = Object.values(
              stats.num_of_datasets_prompts
            ).reduce((sum, value) => {
              if (calcPercentageAtEachDataset) {
                percentageCalculatedTotalPrompts += Math.floor(
                  value * decimalFraction
                );
              }
              return sum + value;
            }, 0);
            const grandTotalPromptsToRun =
              stats.num_of_prompt_templates > 0
                ? totalPromptsFromAllDatasets * stats.num_of_prompt_templates
                : totalPromptsFromAllDatasets;
            let userInputTotalPromptsToRun = 0;
            if (stats.num_of_prompt_templates > 0) {
              if (calcPercentageAtEachDataset) {
                userInputTotalPromptsToRun =
                  percentageCalculatedTotalPrompts *
                  stats.num_of_prompt_templates;
              } else {
                userInputTotalPromptsToRun =
                  decimalFraction *
                  grandTotalPromptsToRun *
                  stats.num_of_prompt_templates;
              }
            } else {
              if (calcPercentageAtEachDataset) {
                userInputTotalPromptsToRun = percentageCalculatedTotalPrompts;
              } else {
                userInputTotalPromptsToRun =
                  decimalFraction * grandTotalPromptsToRun;
              }
            }
            return [
              acc[0] + grandTotalPromptsToRun,
              acc[1] + userInputTotalPromptsToRun,
            ];
          },
          [0, 0] as [number, number]
        );
      }, [recipesStats, decimalFraction]);

    const roundedUserInputNumOfPromptsGrandTotal = Math.max(
      1,
      Math.floor(userInputNumOfPromptsGrandTotal)
    );

    return (
      <>
        <p
          className={`text-white text-[0.9rem] mb-[10px]
          ${percentageOfPrompts === 100 ? 'opacity-50' : 'opacity-100'}`}>
          Number of prompts that will be run:{' '}
          {isPending
            ? 'calculating...'
            : percentageOfPrompts === 100
              ? numOfPromptsGrandTotal
              : roundedUserInputNumOfPromptsGrandTotal}
        </p>
        <div className="flex justify-left gap-2 mb-8">
          <p className="text-moonpurplelight">
            Run All{' '}
            <span
              className={`${percentageOfPrompts === 100 ? 'text-white' : 'text-moongray-400'}`}>
              ({isPending ? 'calculating...' : numOfPromptsGrandTotal} prompts)
            </span>
          </p>
        </div>
      </>
    );
  }

  return (
    <RunForm
      {...benchmarkRunFormConfig}
      selectedCookbooks={selectedCookbooks}
      selectedEndpoints={selectedEndpoints}>
      {({ percentageOfPrompts, isRunAll }) => (
        <BenchmarkPromptDisplay
          recipesStats={recipesStats}
          isPending={isPending}
          percentageOfPrompts={percentageOfPrompts}
          isRunAll={isRunAll}
        />
      )}
    </RunForm>
  );
}

export default BenchmarkRunForm;
