import React from 'react';
import { CookbooksAgenticResult } from '@/app/agentic/report/types/agenticReportTypes';

type AgenticCapabilitiesOverviewProps = {
  capabilities: string[];
  agenticResult: CookbooksAgenticResult;
  endpointId: string;
};

export function AgenticCapabilitiesOverview(
  props: AgenticCapabilitiesOverviewProps
) {
  const { capabilities } = props;

  return (
    <section className="px-6">
      <div className="bg-moongray-900 rounded-lg p-4">
        <h3 className="text-white text-lg font-semibold mb-3">
          Agentic Capabilities Tested
        </h3>
        {capabilities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {capabilities.map((capability) => (
              <span
                key={capability}
                className="px-3 py-1 bg-moongray-700 text-white text-sm rounded-full">
                {capability}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-moongray-400 text-sm">
            No specific agentic capabilities identified in test results.
          </p>
        )}
      </div>
    </section>
  );
}
