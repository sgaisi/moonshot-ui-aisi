import React from 'react';
import { AgenticCookbookResult } from '@/app/agentic/report/types/agenticReportTypes';

type AgenticCookbookReportCardProps = {
  result: AgenticCookbookResult;
  cookbook: Cookbook;
  endpointId: string;
  expanded?: boolean;
  children?: React.ReactNode;
};

export function AgenticCookbookReportCard(
  props: AgenticCookbookReportCardProps
) {
  const { result, cookbook, endpointId, children } = props;

  // Find the overall evaluation for this endpoint
  const overallEvaluation = result.overall_evaluation_summary.find(
    (summary) => summary.model_id === endpointId
  );

  return (
    <div className="bg-moongray-900 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white text-xl font-semibold mb-2">
            {cookbook.name}
          </h3>
          {cookbook.description && (
            <p className="text-moongray-300 text-sm mb-3">
              {cookbook.description}
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-moongray-400">
              Total Prompts:{' '}
              <span className="text-white">{result.total_num_of_prompts}</span>
            </span>
            <span className="text-moongray-400">
              Recipes:{' '}
              <span className="text-white">{result.recipes.length}</span>
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
        {overallEvaluation && (
          <div className="text-right">
            <div className="text-moongray-400 text-sm">Overall Grade</div>
            <div className="text-white text-lg font-semibold">
              {overallEvaluation.overall_grade}
            </div>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
