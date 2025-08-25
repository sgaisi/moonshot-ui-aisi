import React from 'react';

type AgenticReportHeadingProps = {
  runnerNameAndDescription: RunnerHeading;
};

export function AgenticReportHeading(props: AgenticReportHeadingProps) {
  const { runnerNameAndDescription } = props;

  return (
    <section className="px-6 pt-6">
      <h1 className="text-white text-2xl font-bold mb-2">
        Agentic Test Report
      </h1>
      <h2 className="text-white text-xl font-semibold mb-2">
        {runnerNameAndDescription.name}
      </h2>
      {runnerNameAndDescription.description && (
        <p className="text-moongray-300 text-sm">
          {runnerNameAndDescription.description}
        </p>
      )}
    </section>
  );
}
