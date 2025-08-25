import React from 'react';
import { AgenticRecipeEvaluationResult } from '@/app/agentic/report/types/agenticReportTypes';

type AgenticRecipeRatingResultProps = {
  result: AgenticRecipeEvaluationResult;
  recipe: Recipe;
  endpointId: string;
};

export function AgenticRecipeRatingResult(
  props: AgenticRecipeRatingResultProps
) {
  const { result, recipe, endpointId } = props;

  // Find the evaluation summary for this endpoint
  const evaluationSummary = result.evaluation_summary.find(
    (summary) => summary.model_id === endpointId
  );

  return (
    <div className="bg-moongray-800 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-white text-lg font-semibold mb-1">
            {recipe.name}
          </h4>
          {recipe.description && (
            <p className="text-moongray-300 text-sm mb-2">
              {recipe.description}
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="text-moongray-400">
              Prompts:{' '}
              <span className="text-white">{result.total_num_of_prompts}</span>
            </span>
            {result.agentic_capabilities.length > 0 && (
              <span className="text-moongray-400">
                Capabilities:{' '}
                <span className="text-white">
                  {result.agentic_capabilities.join(', ')}
                </span>
              </span>
            )}
          </div>
        </div>
        {evaluationSummary && (
          <div className="text-right">
            <div className="text-moongray-400 text-xs">Grade</div>
            <div className="text-white text-lg font-semibold">
              {evaluationSummary.grade}
            </div>
            <div className="text-moongray-400 text-xs">
              Avg: {evaluationSummary.avg_grade_value?.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Agentic-specific metrics */}
      {evaluationSummary?.agentic_metrics && (
        <div className="border-t border-moongray-700 pt-3">
          <h5 className="text-white text-sm font-medium mb-2">
            Agentic Metrics
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {evaluationSummary.agentic_metrics.avg_tool_usage_success_rate !==
              undefined && (
              <div className="bg-moongray-900 rounded p-2">
                <div className="text-moongray-400">Tool Usage Success</div>
                <div className="text-white font-medium">
                  {(
                    evaluationSummary.agentic_metrics
                      .avg_tool_usage_success_rate * 100
                  ).toFixed(1)}
                  %
                </div>
              </div>
            )}
            {evaluationSummary.agentic_metrics.avg_reasoning_quality !==
              undefined && (
              <div className="bg-moongray-900 rounded p-2">
                <div className="text-moongray-400">Reasoning Quality</div>
                <div className="text-white font-medium">
                  {evaluationSummary.agentic_metrics.avg_reasoning_quality.toFixed(
                    2
                  )}
                </div>
              </div>
            )}
            {evaluationSummary.agentic_metrics.avg_task_completion_rate !==
              undefined && (
              <div className="bg-moongray-900 rounded p-2">
                <div className="text-moongray-400">Task Completion</div>
                <div className="text-white font-medium">
                  {(
                    evaluationSummary.agentic_metrics.avg_task_completion_rate *
                    100
                  ).toFixed(1)}
                  %
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
