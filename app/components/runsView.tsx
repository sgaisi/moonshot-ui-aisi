'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { CSSProperties } from 'react';
import { Icon, IconName } from '@/app/components/IconSVG';
import { Button, ButtonType } from '@/app/components/button';
import { MainSectionSurface } from '@/app/components/mainSectionSurface';
import { colors } from '@/app/customColors';
import { formatDateFromTimestamp } from '@/app/lib/date-utils';

interface CustomStyle extends CSSProperties {
  WebkitLineClamp?: string;
  WebkitBoxOrient?: 'vertical';
}

const ellipsisStyle: CustomStyle = {
  display: '-webkit-box',
  WebkitLineClamp: '2',
  WebkitBoxOrient: 'vertical',
};

export interface RunsViewConfig {
  mode: 'agentic' | 'benchmark';
  title: string;
  newSessionPath: string;
  reportPath: string;
  noRunnersErrorText: string;
}

interface RunsViewProps extends RunsViewConfig {
  runners: Runner[];
  resultIds: string[];
}

// Helper function to get status display info
function getStatusInfo(status?: string) {
  const statusLower = status?.toLowerCase() || 'unknown';

  switch (statusLower) {
    case 'completed':
      return {
        text: 'Completed',
        color: 'text-green-400',
        bgColor: 'bg-green-900/20',
        icon: IconName.CheckedSquare,
      };
    case 'completed_with_errors':
      return {
        text: 'Completed (with errors)',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/20',
        icon: IconName.Warning,
      };
    case 'failed':
      return {
        text: 'Failed',
        color: 'text-red-400',
        bgColor: 'bg-red-900/20',
        icon: IconName.Close,
      };
    case 'running':
      return {
        text: 'Running',
        color: 'text-blue-400',
        bgColor: 'bg-blue-900/20',
        icon: IconName.Lightning,
      };
    case 'running_with_errors':
      return {
        text: 'Running (with errors)',
        color: 'text-orange-400',
        bgColor: 'bg-orange-900/20',
        icon: IconName.Alert,
      };
    case 'cancelled':
      return {
        text: 'Cancelled',
        color: 'text-gray-400',
        bgColor: 'bg-gray-900/20',
        icon: IconName.Close,
      };
    case 'pending':
      return {
        text: 'Pending',
        color: 'text-gray-400',
        bgColor: 'bg-gray-900/20',
        icon: IconName.HistoryClock,
      };
    default:
      return {
        text: 'Unknown',
        color: 'text-gray-400',
        bgColor: 'bg-gray-900/20',
        icon: IconName.OutlineBox,
      };
  }
}

// Helper function to determine if results are available
function hasResults(runner: Runner, resultIds: string[]): boolean {
  // Check if runner is in resultIds list OR has completed status with results
  return (
    resultIds.includes(runner.id) ||
    (!!runner.status &&
      ['completed', 'completed_with_errors'].includes(
        runner.status.toLowerCase()
      ) &&
      !!(runner.results || runner.raw_results))
  );
}

function RunsView({
  mode: _mode,
  title,
  newSessionPath,
  reportPath,
  noRunnersErrorText,
  runners,
  resultIds,
}: RunsViewProps) {
  const searchParams = useSearchParams();
  const [selectedRunner, setSelectedRunner] = React.useState<Runner>(() => {
    const id = searchParams.get('id');
    if (!Boolean(id)) {
      return runners[0];
    }
    return runners.find((runner) => runner.id === id) || runners[0];
  });

  if (runners.length === 0) {
    throw new Error(noRunnersErrorText, {
      cause: 'NO_RUNNERS_FOUND',
    });
  }

  return (
    <MainSectionSurface
      closeLinkUrl="/"
      height="100%"
      bgColor={colors.moongray['950']}>
      <div className="relative h-full">
        <header className="flex gap-5 mb-3 justify-between items-end w-full">
          <h1 className="text-[1.6rem] text-white mt-3">{title}</h1>
          <Link href={newSessionPath}>
            <Button
              size="md"
              mode={ButtonType.OUTLINE}
              leftIconName={IconName.Plus}
              text="Start New Run"
              hoverBtnColor={colors.moongray[800]}
            />
          </Link>
        </header>
        <main
          className="grid grid-cols-2 gap-5"
          style={{ height: 'calc(100% - 140px)' }}>
          <ul
            className="divide-y divide-moongray-700 pr-1 overflow-y-auto custom-scrollbar"
            role="listbox">
            {runners.map((runner) => {
              const isSelected = runner.id === selectedRunner.id;
              const statusInfo = getStatusInfo(runner.status);
              return (
                <li
                  key={runner.id}
                  className="p-6 bg-moongray-900 text-white hover:bg-moongray-800 
                  hover:border-moonwine-700 cursor-pointer"
                  style={{
                    transition: 'background-color 0.2s ease-in-out',
                    ...(isSelected && {
                      backgroundColor: colors.moongray['700'],
                    }),
                  }}
                  onClick={() => setSelectedRunner(runner)}>
                  <div className="flex gap-2 mb-2 justify-between items-start">
                    <div className="flex gap-2 items-center">
                      <Icon name={IconName.HistoryClock} />
                      <h4 className="text-[1rem] font-semibold">
                        {runner.name}
                      </h4>
                    </div>
                    {/* Status Badge */}
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${statusInfo.bgColor} ${statusInfo.color}`}>
                      <Icon
                        name={statusInfo.icon}
                        size={12}
                      />
                      <span>{statusInfo.text}</span>
                    </div>
                  </div>
                  <p
                    className="text-[0.8rem] h-[40px] overflow-hidden text-ellipsis text-moongray-400 break-all break-words"
                    style={ellipsisStyle}>
                    {runner.description}
                  </p>
                  {runner.start_time && (
                    <p className="text-[0.8rem] text-moongray-300 text-right">
                      Started on {formatDateFromTimestamp(runner.start_time)}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          <section className="text-white border border-moonwine-500 p-4 rounded-md overflow-y-auto custom-scrollbar bg-moongray-800">
            <div className="flex gap-2 mb-4 justify-between items-start">
              <div className="flex gap-2 items-center">
                <Icon
                  name={IconName.HistoryClock}
                  size={24}
                />
                <h3 className="text-[1.2rem] font-semibold">
                  {selectedRunner.name}
                </h3>
              </div>
              {/* Status Display */}
              {selectedRunner.status && (
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-md ${getStatusInfo(selectedRunner.status).bgColor} ${getStatusInfo(selectedRunner.status).color}`}>
                  <Icon
                    name={getStatusInfo(selectedRunner.status).icon}
                    size={16}
                  />
                  <span className="text-sm font-medium">
                    {getStatusInfo(selectedRunner.status).text}
                  </span>
                </div>
              )}
            </div>

            <p className="text-[0.95rem] text-moongray-300 mb-4">
              {selectedRunner.description}
            </p>

            {/* Status Details */}
            {selectedRunner.status && (
              <>
                <h4 className="text-[1.15rem] font-semibold mt-6 mb-2">
                  Run Status
                </h4>
                <div className="bg-moongray-900 p-3 rounded-md mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      name={getStatusInfo(selectedRunner.status).icon}
                      size={16}
                    />
                    <span
                      className={`font-medium ${getStatusInfo(selectedRunner.status).color}`}>
                      {getStatusInfo(selectedRunner.status).text}
                    </span>
                  </div>
                  {selectedRunner.duration && (
                    <p className="text-[0.85rem] text-moongray-400">
                      Duration: {Math.floor(selectedRunner.duration / 60)}m{' '}
                      {selectedRunner.duration % 60}s
                    </p>
                  )}
                  {selectedRunner.end_time && (
                    <p className="text-[0.85rem] text-moongray-400">
                      Completed:{' '}
                      {formatDateFromTimestamp(selectedRunner.end_time)}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Error Messages */}
            {selectedRunner.error_messages &&
              selectedRunner.error_messages.length > 0 && (
                <>
                  <h4 className="text-[1.15rem] font-semibold mt-6 mb-2 text-red-400">
                    Error Messages
                  </h4>
                  <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-md mb-4">
                    {selectedRunner.error_messages.map((error, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 mb-2 last:mb-0">
                        <Icon
                          name={IconName.Alert}
                          size={16}
                          color="#f87171"
                        />
                        <p className="text-[0.85rem] text-red-300 leading-relaxed">
                          {error}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}

            <h4 className="text-[1.15rem] font-semibold mt-6 mb-1">
              Model Endpoints
            </h4>
            <p className="text-[0.95rem] text-moongray-300">
              {selectedRunner.endpoints.map((endpoint, idx, endpoints) => {
                return (
                  <span key={endpoint}>
                    {endpoint}
                    {idx === endpoints.length - 1 ? '' : `,`}
                    &nbsp;
                  </span>
                );
              })}
            </p>
            <h4 className="text-[1.15rem] font-semibold mt-6 mb-1">
              Cookbooks
            </h4>
            <p className="text-[0.95rem] text-moongray-300">
              {selectedRunner.runner_args &&
                'cookbooks' in selectedRunner.runner_args &&
                selectedRunner.runner_args.cookbooks.map(
                  (cookbook, idx, cookbooks) => {
                    return (
                      <span key={cookbook}>
                        {cookbook}
                        {idx === cookbooks.length - 1 ? '' : `,`}
                        &nbsp;
                      </span>
                    );
                  }
                )}
            </p>

            <h4 className="text-[1.15rem] font-semibold mt-6 mb-1">
              Percentage of Prompts sent
            </h4>
            <p className="text-[0.95rem] text-moongray-300">
              {selectedRunner.runner_args &&
                selectedRunner.runner_args.prompt_selection_percentage}
              %
            </p>

            {selectedRunner.start_time && (
              <p className="text-[1rem] text-moongray-300 text-right pt-6">
                Started on {formatDateFromTimestamp(selectedRunner.start_time)}
              </p>
            )}
          </section>
        </main>
        <footer className="absolute bottom-0 w-full flex justify-end gap-4">
          {hasResults(selectedRunner, resultIds) && (
            <Link href={`${reportPath}?id=${selectedRunner.id}`}>
              <Button
                size="lg"
                mode={ButtonType.PRIMARY}
                text="View Results"
                hoverBtnColor={colors.moongray[1000]}
                pressedBtnColor={colors.moongray[900]}
              />
            </Link>
          )}
        </footer>
      </div>
    </MainSectionSurface>
  );
}

export { RunsView };
