import React from 'react';
import { AgenticCookbookCategoryLabels } from '@/app/agentic/report/types/agenticReportTypes';

type AgenticRunSummaryProps = {
  cookbooksInReport: Cookbook[];
  cookbookCategoryLabels: AgenticCookbookCategoryLabels;
  endpointName: string;
  totalPrompts: number;
  startTime: string;
  endTime: string;
};

export function AgenticRunSummary(props: AgenticRunSummaryProps) {
  const { cookbooksInReport, endpointName, totalPrompts, startTime, endTime } =
    props;

  return (
    <section className="px-6">
      <div className="bg-moongray-900 rounded-lg p-4">
        <h3 className="text-white text-lg font-semibold mb-3">Run Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-moongray-400">Endpoint:</span>
            <span className="text-white ml-2">{endpointName}</span>
          </div>
          <div>
            <span className="text-moongray-400">Total Prompts:</span>
            <span className="text-white ml-2">{totalPrompts}</span>
          </div>
          <div>
            <span className="text-moongray-400">Cookbooks Tested:</span>
            <span className="text-white ml-2">{cookbooksInReport.length}</span>
          </div>
          <div>
            <span className="text-moongray-400">Test Type:</span>
            <span className="text-white ml-2">Agentic Capabilities</span>
          </div>
          <div>
            <span className="text-moongray-400">Start Time:</span>
            <span className="text-white ml-2">{startTime}</span>
          </div>
          <div>
            <span className="text-moongray-400">End Time:</span>
            <span className="text-white ml-2">{endTime}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
