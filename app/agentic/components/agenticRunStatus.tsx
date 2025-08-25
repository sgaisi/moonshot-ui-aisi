'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { startTransition } from 'react';
import { getRecipesStatsById } from '@/actions/getRecipesStatsById';
import { Icon, IconName } from '@/app/components/IconSVG';
import { ActionCard } from '@/app/components/actionCard/actionCard';
import { Button, ButtonType } from '@/app/components/button';
import { MainSectionSurface } from '@/app/components/mainSectionSurface';
import { Modal } from '@/app/components/modal';
import { PopupSurface } from '@/app/components/popupSurface';
import { colors } from '@/app/customColors';
import { useEventSource } from '@/app/hooks/use-eventsource';
import { useIsResponsiveBreakpoint } from '@/app/hooks/useIsResponsiveBreakpoint';
import { useCancelAgenticMutation } from '@/app/services/agentic-api-service';
import { useGetAgenticStatusQuery } from '@/app/services/agentic-status-api-service';
import { useGetCookbooksQuery } from '@/app/services/cookbook-api-service';
import { useGetLLMEndpointsQuery } from '@/app/services/llm-endpoint-api-service';
import { useGetRunnerByIdQuery } from '@/app/services/runner-api-service';
import { AppEventTypes, TestStatusProgress } from '@/app/types/enums';
import {
  resetAgenticCookbooks,
  resetAgenticModels,
  useAppDispatch,
} from '@/lib/redux';

function AgenticRunStatus({ allStatuses }: { allStatuses: TestStatuses }) {
  const [showRunDetails, setShowRunDetails] = React.useState(false);
  const [isCancelBtnDisabled, setIsCancelBtnDisabled] = React.useState(false);
  const [recipesStats, setRecipesStats] = React.useState<RecipeStats[]>([]);
  const [statuses, setStatuses] = React.useState<TestStatuses | undefined>(
    () => allStatuses
  );
  const [eventData, closeEventSource] = useEventSource<
    TestStatus,
    AppEventTypes
  >('/api/v1/stream', AppEventTypes.AGENTIC_UPDATE);
  const { data = {}, isLoading } = useGetAgenticStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Fallback: if agentic status fails, at least show the initial status
  const effectiveStatuses =
    data && Object.keys(data).length > 0 ? data : allStatuses;
  const [triggerCancelAgentic, { isLoading: isCancelling }] =
    useCancelAgenticMutation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const runner_id = searchParams.get('runner_id');
  const { data: runnerData } = useGetRunnerByIdQuery(
    { id: runner_id, additionalDetails: true },
    { skip: !runner_id }
  );
  const [showErrors, setShowErrors] = React.useState(false);
  const { data: endpointsData } = useGetLLMEndpointsQuery(undefined, {
    skip: !runnerData,
  });
  const { data: cookbooksData } = useGetCookbooksQuery(
    {
      ids:
        runnerData &&
        runnerData.runner_args &&
        'cookbooks' in runnerData.runner_args
          ? runnerData.runner_args.cookbooks
          : [],
    },
    { skip: !runnerData }
  );
  const screenSize = useIsResponsiveBreakpoint();

  React.useEffect(() => {
    if (!statuses) return;
    if (eventData) {
      if (!eventData.current_runner_id) return;
      const id = eventData.current_runner_id;
      if (
        statuses[id] &&
        statuses[id].current_progress == eventData.current_progress &&
        statuses[id].current_status == eventData.current_status
      )
        return; // if the progress percentage and status is the same, don't update

      setStatuses((prev) => {
        return { ...prev, [id]: eventData };
      });
    }
  }, [eventData]);

  React.useEffect(() => {
    if (!isLoading) {
      if (effectiveStatuses && Object.keys(effectiveStatuses).length > 0) {
        setStatuses(effectiveStatuses);
      } else {
        // Status is empty - runner might not exist or completed
        console.warn(
          `No status found for agentic tests. Runner ID: ${runner_id}`
        );
        console.warn('Available statuses:', effectiveStatuses);
      }
    }
  }, [isLoading, effectiveStatuses, runner_id]);

  React.useEffect(() => {
    dispatch(resetAgenticCookbooks());
    dispatch(resetAgenticModels());
    return () => {
      closeEventSource();
    };
  }, []);

  React.useEffect(() => {
    if (!cookbooksData) return;
    startTransition(() => {
      getRecipesStatsById(
        cookbooksData.reduce((allRecipes, cookbook) => {
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
  }, [cookbooksData]);

  const calcPercentageAtEachDataset = true;

  const userInputNumOfPromptsGrandTotal = React.useMemo(() => {
    // Simplified calculation for agentic tests
    // Agentic tests use direct cookbook → dataset mapping, not complex recipe structures
    if (!runnerData) return 0;

    // If we have recipe stats (complex benchmarking structure), use them
    if (
      recipesStats.length > 0 &&
      runnerData?.runner_args?.prompt_selection_percentage != undefined
    ) {
      const decimalFraction =
        runnerData.runner_args.prompt_selection_percentage / 100;
      return recipesStats.reduce((acc, stats) => {
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
              percentageCalculatedTotalPrompts * stats.num_of_prompt_templates;
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
        return acc + userInputTotalPromptsToRun;
      }, 0);
    }

    // Fallback for agentic tests: simple estimation based on cookbooks and endpoints
    const numCookbooks =
      runnerData.runner_args && 'cookbooks' in runnerData.runner_args
        ? runnerData.runner_args.cookbooks.length
        : 1;
    const numEndpoints = runnerData.endpoints ? runnerData.endpoints.length : 1;

    // Estimate: each cookbook might have ~50 prompts, multiply by endpoints
    return numCookbooks * numEndpoints * 50;
  }, [recipesStats, runnerData]);

  const roundedUserInputNumOfPromptsGrandTotal = Math.max(
    1,
    Math.floor(userInputNumOfPromptsGrandTotal as number)
  );

  const endpoints =
    endpointsData &&
    endpointsData.filter(
      (ep) =>
        runnerData &&
        runnerData.endpoints &&
        runnerData.endpoints.includes(ep.id)
    );
  const cookbooks = cookbooksData && cookbooksData;

  let headingText = 'Running Agentic Tests...';
  let showNoStatusMessage = false;

  if (statuses && runner_id !== null && statuses[runner_id]) {
    if (statuses[runner_id].current_status == TestStatusProgress.RUNNING) {
      headingText = 'Running Agentic Tests...';
    }
    if (statuses[runner_id].current_status == TestStatusProgress.COMPLETED) {
      headingText = 'Agentic Tests Completed';
    }
    if (statuses[runner_id].current_status == TestStatusProgress.CANCELLED) {
      headingText = 'Agentic Tests Cancelled';
    }
    if (statuses[runner_id].current_status == TestStatusProgress.ERRORS) {
      headingText = 'Agentic Tests Completed';
    }
  } else if (runner_id && (!statuses || !statuses[runner_id])) {
    // No status found for this runner - it might have completed very quickly or failed to start
    headingText = 'Agentic Test Status Unknown';
    showNoStatusMessage = true;
  }

  function handleCancelBtnClick(id: string) {
    return () => {
      setIsCancelBtnDisabled(true);
      triggerCancelAgentic(id);
    };
  }

  const progress =
    runner_id != null &&
    statuses &&
    statuses[runner_id] &&
    statuses[runner_id].current_progress != undefined
      ? statuses[runner_id].current_progress
      : 0;
  const progressBox = runner_id != null && (
    <div className="w-full flex flex-col items-center gap-2 mt-5">
      {!showRunDetails && (
        <p className="text-white text-[0.9rem] w-[90%] pl-4">
          {runnerData && runnerData.name}
        </p>
      )}
      <div
        className="w-[90%] h-[140px] ipad11Inch:h-[110px] ipadPro:h-[110px] items-center flex gap-4
        border border-moongray-700 px-8 rounded-[20px]">
        <div className="w-full flex flex-col gap-2">
          <p className="text-white text-[1.1rem] w-[90%]">
            {statuses &&
            statuses[runner_id] &&
            statuses[runner_id].current_status == TestStatusProgress.CANCELLED
              ? 'Cancelled'
              : `${progress}%`}
            {statuses &&
              statuses[runner_id] &&
              statuses[runner_id].current_status == TestStatusProgress.ERRORS &&
              ' (with error)'}
          </p>
          <div
            className={`${
              statuses &&
              statuses[runner_id] &&
              statuses[runner_id].current_status == TestStatusProgress.ERRORS
                ? 'bg-red-700'
                : statuses &&
                    statuses[runner_id] &&
                    statuses[runner_id].current_status ==
                      TestStatusProgress.CANCELLED
                  ? 'bg-moonwine-400'
                  : 'bg-blue-600'
            } leading-none h-2 rounded-full`}
            style={{
              width: `${progress}%`,
              animation:
                statuses &&
                statuses[runner_id] &&
                statuses[runner_id].current_status == TestStatusProgress.RUNNING
                  ? 'pulse 1.5s infinite ease-out'
                  : 'none',
            }}
          />
        </div>

        {/* clean this madness */}
        {!statuses ||
        !statuses[runner_id] ||
        (statuses &&
          statuses[runner_id] &&
          statuses[runner_id].current_status !== TestStatusProgress.COMPLETED &&
          statuses[runner_id].current_status !== TestStatusProgress.ERRORS &&
          statuses[runner_id].current_status !==
            TestStatusProgress.CANCELLED) ? (
          <div
            style={{
              opacity: isCancelling || isCancelBtnDisabled ? 0.8 : 1,
            }}>
            <Button
              disabled={isCancelling || isCancelBtnDisabled}
              mode={ButtonType.OUTLINE}
              size="lg"
              type="button"
              hoverBtnColor={colors.moongray[700]}
              pressedBtnColor={colors.moongray[900]}
              text={isCancelling ? 'Cancelling...' : 'Cancel'}
              onClick={handleCancelBtnClick(runner_id)}
            />
          </div>
        ) : null}
        {statuses &&
          statuses[runner_id] &&
          (statuses[runner_id].current_status ===
            TestStatusProgress.COMPLETED ||
            statuses[runner_id].current_status ===
              TestStatusProgress.CANCELLED) && (
            <Link href={`/agentic/report?id=${runner_id}`}>
              <Button
                width={150}
                mode={ButtonType.OUTLINE}
                size={screenSize === 'sm' || screenSize === 'md' ? 'md' : 'lg'}
                type="button"
                hoverBtnColor={colors.moongray[700]}
                pressedBtnColor={colors.moongray[900]}
                text="View Report"
              />
            </Link>
          )}

        {statuses &&
          statuses[runner_id] &&
          statuses[runner_id].current_status === TestStatusProgress.ERRORS && (
            <Button
              width={150}
              mode={ButtonType.OUTLINE}
              size="lg"
              type="button"
              hoverBtnColor={colors.moongray[700]}
              pressedBtnColor={colors.moongray[900]}
              text="View Errors"
              onClick={() => setShowErrors(true)}
            />
          )}
      </div>
    </div>
  );

  return (
    <>
      {showErrors && statuses && runner_id && (
        <Modal
          heading="Errors"
          bgColor={colors.moongray['800']}
          textColor="#FFFFFF"
          primaryBtnLabel="Close"
          enableScreenOverlay
          onCloseIconClick={() => setShowErrors(false)}
          onPrimaryBtnClick={() => setShowErrors(false)}>
          <div className="flex gap-2 items-start">
            <Icon
              name={IconName.Alert}
              size={40}
              color="red"
            />
            <ul>
              {statuses[runner_id].current_error_messages.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        </Modal>
      )}
      <MainSectionSurface
        onCloseIconClick={() => router.push('/agentic')}
        height="100%"
        bgColor={colors.moongray['950']}>
        <div className="flex flex-col h-full gap-4 ipad11Inch:gap-1 ipadPro:gap-1">
          {showRunDetails && runnerData ? (
            <PopupSurface
              style={{
                backgroundColor: colors.moongray['900'],
                border: 'none',
              }}
              height="100%"
              padding="10px"
              onCloseIconClick={() => setShowRunDetails(false)}>
              <div className="px-10 py-8 h-full">
                <header className="text-white">
                  <h1 className="text-[1.6rem]  mb-2 ">Run Details</h1>
                  <div className="flex flex-col gap-2 items-center">
                    <p>
                      <span className="text-moonwine-400 pr-2">Name:</span>
                      {runnerData.name}
                    </p>
                    <p>
                      <span className="text-moonwine-400 pr-2">
                        Description:
                      </span>
                      {runnerData.description}
                    </p>
                    <p>
                      <span className="text-moonwine-400 pr-2">
                        Number of prompts to run:
                      </span>
                      {roundedUserInputNumOfPromptsGrandTotal}
                    </p>
                  </div>
                </header>
                {progressBox}
                <div
                  className="overflow-x-hidden overflow-y-auto custom-scrollbar px-8 mt-4
                  h-[320px] ipad11Inch:mt-1 ipad11Inch:h-[120px] ipadPro:h-[120px]">
                  <section className="pt-6 w-full px-8 mb-5">
                    <p className="text-moonwine-400">Model Endpoints</p>
                    <div className="grid grid-cols-2 gap-10 w-full">
                      {endpoints &&
                        endpoints.map((ep) => (
                          <div
                            key={ep.id}
                            className="flex flex-col gap-2 border border-moonwine-600
                          rounded-[15px] p-5 text-white">
                            <div className="flex flex-row gap-2">
                              <Icon
                                name={IconName.OutlineBox}
                                size={20}
                              />
                              <p className="text-[1.2rem] ipad11Inch:text-[0.9rem] ipadPro:text-[0.9rem]">
                                {ep.name}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>

                  <section className="pt-6 w-full px-8 mb-4">
                    <p className="text-moonwine-400 pb-2">Cookbooks</p>
                    <div className="grid grid-cols-2 gap-10 w-full">
                      {cookbooks &&
                        cookbooks.map((cb) => (
                          <div
                            key={cb.id}
                            className="flex flex-col gap-2 border border-moonwine-600
                          rounded-[15px] p-5 text-white">
                            <div className="flex flex-row gap-2">
                              <Icon
                                name={IconName.OutlineBox}
                                size={20}
                              />
                              <p className="text-[1.2rem] ipad11Inch:text-[0.9rem] ipadPro:text-[0.9rem]">
                                {cb.name}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                </div>
              </div>
            </PopupSurface>
          ) : !isLoading ? (
            <>
              <div className="flex flex-col items-center gap-4 pt-8">
                <div className="flex items-center gap-4">
                  <Icon
                    name={IconName.Tools}
                    size={48}
                    color={colors.moonpurplelight}
                  />
                  <h2 className="text-[1.6rem] ipad11Inch:text-[1.2rem] ipadPro:text-[1.2rem] font-medium tracking-wide text-white text-center">
                    {headingText}
                  </h2>
                </div>
                <Button
                  mode={ButtonType.OUTLINE}
                  hoverBtnColor={colors.moongray[700]}
                  pressedBtnColor={colors.moongray[900]}
                  size="md"
                  type="button"
                  text="See Details"
                  onClick={() => setShowRunDetails(!showRunDetails)}
                />
              </div>

              <section className="relative flex w-full justify-center mb-5">
                {showNoStatusMessage ? (
                  <div className="w-[90%] bg-moongray-900 p-6 rounded-lg text-center">
                    <div className="flex justify-center mb-3">
                      <Icon
                        name={IconName.Alert}
                        size={32}
                        color={colors.moonwine[400]}
                      />
                    </div>
                    <p className="text-white text-lg mb-2">
                      No Status Available
                    </p>
                    <p className="text-moongray-400 text-sm mb-4">
                      The agentic test with ID{' '}
                      <span className="text-moonpurplelight font-mono">
                        {runner_id}
                      </span>{' '}
                      is not currently tracked in the status system.
                    </p>
                    <div className="text-moongray-400 text-sm space-y-1">
                      <p>This could mean the test:</p>
                      <p>• Completed very quickly</p>
                      <p>• Failed to start properly</p>
                      <p>• Is using a different tracking system</p>
                    </div>
                    <div className="mt-4">
                      <Link href={`/agentic/report?id=${runner_id}`}>
                        <Button
                          width={150}
                          mode={ButtonType.OUTLINE}
                          size="md"
                          type="button"
                          hoverBtnColor={colors.moongray[700]}
                          pressedBtnColor={colors.moongray[900]}
                          text="Try View Report"
                        />
                      </Link>
                    </div>
                  </div>
                ) : (
                  progressBox
                )}
              </section>

              <section className="w-full flex flex-col gap-2 items-center">
                <div className="w-[90%] flex flex-col gap-3">
                  <p className="text-white text-[1.1rem]">
                    While waiting for these to run, you can
                  </p>
                  <div className="col-span-3 grid grid-cols-3 gap-[1.7%] w-[90%]">
                    <Link href="/redteaming/sessions/new">
                      <ActionCard
                        variant="compact"
                        className={`${
                          screenSize === 'sm' || screenSize === 'md'
                            ? '!h-[170px] !p-[16px]'
                            : '!h-[240px] !p-[16px]'
                        }`}
                        iconSize={
                          screenSize === 'sm' || screenSize === 'md' ? 28 : 35
                        }
                        cardColor={colors.moongray[800]}
                        title="Discover"
                        description="new vulnerabilities"
                        descriptionColor={colors.moongray[300]}
                        iconName={IconName.Spacesuit}
                        actionText="Start Red Teaming"
                      />
                    </Link>
                    <Link href="/benchmarking/cookbooks/new">
                      <ActionCard
                        variant="compact"
                        className={`${
                          screenSize === 'sm' || screenSize === 'md'
                            ? '!h-[170px] !p-[16px]'
                            : '!h-[240px] !p-[16px]'
                        }`}
                        iconSize={
                          screenSize === 'sm' || screenSize === 'md' ? 28 : 35
                        }
                        title="Create"
                        description="cookbooks"
                        descriptionColor={colors.moongray[300]}
                        cardColor={colors.moongray[800]}
                        iconName={IconName.Book}
                        actionText="Select Recipes"
                      />
                    </Link>
                    <div className="flex flex-col gap-2 justify-center">
                      <Button
                        rightIconName={IconName.ArrowRight}
                        mode={ButtonType.LINK}
                        size="md"
                        type="button"
                        text="Back to home"
                        onClick={() => router.push('/')}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <div className="relative h-full">
              <div className="ring">
                Loading
                <span />
              </div>
            </div>
          )}
        </div>
      </MainSectionSurface>
    </>
  );
}

export { AgenticRunStatus };
