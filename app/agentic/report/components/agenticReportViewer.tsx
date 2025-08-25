'use client';
import html3pdf from 'html3pdf';
import React from 'react';
import { flushSync } from 'react-dom';
import { CookbooksAgenticResult } from '@/app/agentic/report/types/agenticReportTypes';
import { AgenticCookbookCategoryLabels } from '@/app/agentic/report/types/agenticReportTypes';
import { isWebkit } from '@/app/benchmarking/utils/isWebkit';
import { AgenticHeaderControls } from './agenticHeaderControls';
import { AgenticReport } from './agenticReport';

type AgenticReportViewerProps = {
  agenticResult: CookbooksAgenticResult;
  runnerNameAndDescription: RunnerHeading;
  cookbookCategoryLabels: AgenticCookbookCategoryLabels;
  cookbooksInReport: Cookbook[];
  recipes: Recipe[];
  endpoints: LLMEndpoint[];
};

const AgenticPrintingContext = React.createContext({
  prePrintingFlagEnabled: false,
});

function AgenticReportViewer(props: AgenticReportViewerProps) {
  const { agenticResult, runnerNameAndDescription, endpoints } = props;
  const [prePrintingFlagEnabled, setPrePrintingFlagEnabled] =
    React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const [selectedEndpointId, setSelectedEndpointId] = React.useState(
    agenticResult.metadata.endpoints[0]
  );
  const reportRef = React.useRef<HTMLDivElement>(null);

  const selectedEndpointName =
    endpoints.find((endpoint) => endpoint.id === selectedEndpointId)?.name ||
    selectedEndpointId;

  async function printReport() {
    if (!reportRef.current) return;
    const report = reportRef.current;
    await html3pdf()
      .set({
        margin: 0.2,
        filename: `agentic-report-${runnerNameAndDescription.name}-${selectedEndpointId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        jsPDF: { format: 'a4', orientation: 'portrait' },
      })
      .from(report)
      .save();
    setExpanded(false);
    setPrePrintingFlagEnabled(false);
  }

  function handleHeaderBtnClick() {
    flushSync(() => {
      setPrePrintingFlagEnabled(true);
      setExpanded(true);
    });
    setTimeout(
      () => {
        printReport();
      },
      isWebkit() ? 1000 : 0 // scheduling issue that causes the report to be printed before the page is fully expanded, in webkit browsers
    );
  }

  return (
    <div className="relative flex flex-col gap-5 items-center h-full">
      <AgenticHeaderControls
        agenticResult={agenticResult}
        onEndpointChange={setSelectedEndpointId}
        onBtnClick={handleHeaderBtnClick}
        disabled={prePrintingFlagEnabled}
      />
      <AgenticPrintingContext.Provider value={{ prePrintingFlagEnabled }}>
        <AgenticReport
          {...props}
          endpointId={selectedEndpointId}
          endpointName={selectedEndpointName}
          ref={reportRef}
          expanded={expanded}
        />
      </AgenticPrintingContext.Provider>
    </div>
  );
}

export { AgenticReportViewer, AgenticPrintingContext };
