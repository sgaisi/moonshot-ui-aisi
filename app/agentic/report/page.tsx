import { notFound } from 'next/navigation';
import React from 'react';
import { MainSectionSurface } from '@/app/components/mainSectionSurface';
import { colors } from '@/app/customColors';
import { Icon, IconName } from '@/app/components/IconSVG';
export const dynamic = 'force-dynamic';

export default async function AgenticReportPage(props: {
  searchParams: { id: string };
}) {
  const runnerId = props.searchParams.id;

  if (!runnerId) {
    return notFound();
  }

  return (
    <MainSectionSurface
      closeLinkUrl="/agentic"
      height="100%"
      bgColor={colors.moongray['950']}>
      <div className="flex flex-col items-center justify-center h-full gap-8">
        <div className="flex items-center gap-4">
          <Icon
            name={IconName.Tools}
            size={48}
            color={colors.moonpurplelight}
          />
          <h1 className="text-3xl font-bold text-white">Agentic Test Report</h1>
        </div>

        <div className="bg-moongray-900 p-8 rounded-lg max-w-2xl text-center">
          <p className="text-white text-lg mb-4">
            Agentic test report for run ID:
          </p>
          <p className="text-moonpurplelight font-mono text-sm break-all mb-6">
            {runnerId}
          </p>

          <div className="text-moongray-400 text-sm space-y-2">
            <p>📊 Test results and analysis will be displayed here</p>
            <p>🤖 Agentic performance metrics and insights</p>
            <p>📈 Detailed conversation logs and scoring</p>
          </div>

          <div className="mt-6 p-4 bg-moongray-800 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ Report functionality is currently being developed. Results will
              be available once the agentic backend APIs are fully integrated.
            </p>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/agentic"
            className="text-moonpurplelight hover:underline">
            ← Back to Agentic Home
          </a>
        </div>
      </div>
    </MainSectionSurface>
  );
}
