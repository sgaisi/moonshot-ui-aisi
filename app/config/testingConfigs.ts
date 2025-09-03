import { MenuItem } from '@/app/components/testingHomePage';
import { CookbookSelectorConfig } from '@/app/components/cookbookSelector/cookbookSelector';
import { RunFormConfig } from '@/app/components/runForm';
import { RunsViewConfig } from '@/app/components/runsView';
import { RunStatusConfig } from '@/app/components/runStatus/runStatus';
import { IconName } from '@/app/components/IconSVG';
import { TabItem } from '@/app/components/tabsMenu';
import {
  addBenchmarkCookbooks,
  removeBenchmarkCookbooks,
  updateBenchmarkCookbooks,
  resetBenchmarkCookbooks,
  resetBenchmarkModels,
} from '@/lib/redux';
import { createRun } from '@/actions/createRun';
import { useCancelBenchmarkMutation } from '@/app/services/benchmark-api-service';
import { useGetAllStatusQuery } from '@/app/services/status-api-service';
import { AppEventTypes } from '@/app/types/enums';
import config from '@/moonshot.config';

export const benchmarkingConfig: { title: string; menuItems: MenuItem[] } = {
  title: 'testing with moonshot',
  menuItems: [
    {
      href: '/benchmarking/session/new?skip_topics=true',
      text: 'Start New Run',
      iconName: IconName.CheckList,
    },
    {
      href: '/benchmarking/runs',
      text: 'View Past Runs',
      iconName: IconName.HistoryClock,
    },
    {
      href: '/benchmarking/cookbooks',
      text: 'View Cookbooks',
      iconName: IconName.Book,
    },
    {
      href: '/benchmarking/recipes',
      text: 'View Recipes',
      iconName: IconName.File,
    },
  ],
};

export const redteamingConfig: { title: string; menuItems: MenuItem[] } = {
  title: 'red team with moonshot',
  menuItems: [
    {
      href: '/redteaming/sessions/new',
      text: 'Start New Session',
      iconName: IconName.Spacesuit,
    },
    {
      href: '/redteaming/sessions',
      text: 'View Past Sessions',
      iconName: IconName.HistoryClock,
    },
    {
      href: '/redteaming/attackmodules',
      text: 'View Attack Modules',
      iconName: IconName.MoonAttackStrategy,
    },
    {
      href: '/redteaming/bookbooks',
      text: 'View Bookmarks',
      iconName: IconName.Ribbon,
    },
  ],
};

// Enhanced cookbook selector configuration that includes agentic support
const enhancedCategoryDescriptions = {
  capability:
    "Capability assesses the AI model's ability to perform within the context of the unique requirements and challenges of a particular domain or task.",
  trustAndSafety:
    'Trust & Safety addresses the reliability, ethical considerations, and inherent risks of the AI model. It also examines potential scenarios where the AI system could be used maliciously or unethically.',
  agentic:
    'Agentic cookbooks contain AISI Joint Testing datasets designed specifically for evaluating AI models in autonomous, multi-step reasoning scenarios.',
  others:
    'Other available cookbooks that can be used for benchmarking. Select the cookbooks that best fit your testing requirements.',
};

// Create enhanced tab items that include agentic
const createEnhancedTabItems = (): TabItem<string[]>[] => {
  const agenticTab: TabItem<string[]> = {
    id: 'agentic',
    label: 'Agentic Cookbooks',
    data: [],
  };

  return [...config.cookbookCategoriesTabs, agenticTab];
};

export const benchmarkCookbookSelectorConfig: CookbookSelectorConfig = {
  mode: 'benchmark',
  tabItems: createEnhancedTabItems(),
  categoryDescriptions: enhancedCategoryDescriptions,
  reduxSelector: (state: Record<string, unknown>) =>
    (state as { benchmarkCookbooks: { entities: Cookbook[] } })
      .benchmarkCookbooks.entities,
  reduxActions: {
    add: addBenchmarkCookbooks,
    remove: removeBenchmarkCookbooks,
    update: updateBenchmarkCookbooks,
  },
};

// Enhanced RunForm configuration that supports both benchmark and agentic modes
export const createRunFormConfig = (
  mode: 'benchmark' | 'agentic'
): RunFormConfig => {
  const isAgentic = mode === 'agentic';

  return {
    mode,
    formAction: createRun as (
      prevState: unknown,
      formData: FormData
    ) => Promise<unknown>,
    initialFormValues: {
      formStatus: 'initial',
      formErrors: undefined,
      run_name: '',
      description: '',
      inputs: [],
      endpoints: [],
      prompt_selection_percentage: '1',
      system_prompt: '',
      runner_processing_module: isAgentic ? 'agentic' : 'benchmarking',
      random_seed: isAgentic ? '1' : '0',
    },
    placeholders: {
      name: isAgentic
        ? 'Give this agentic session a unique name'
        : 'Give this session a unique name',
      description: isAgentic
        ? 'Description of this agentic run'
        : 'Description of this benchmark run',
    },
    defaultPercentage: 1,
  };
};

// For backward compatibility, keep the original exports
export const benchmarkRunFormConfig: RunFormConfig =
  createRunFormConfig('benchmark');

// Enhanced RunsView configuration that supports filtering by mode
export const createRunsViewConfig = (): RunsViewConfig => {
  return {
    mode: 'benchmark', // Always use benchmark mode for the UI
    title: 'Past  Runs',
    newSessionPath: '/benchmarking/session/new',
    reportPath: '/benchmarking/report',
    noRunnersErrorText: 'No past runs found',
  };
};

// For backward compatibility
export const benchmarkRunsViewConfig: RunsViewConfig = createRunsViewConfig();

// Enhanced RunStatus configuration that supports both modes
export const createRunStatusConfig = (): RunStatusConfig => {
  return {
    mode: 'benchmark', // Always use benchmark mode for the UI
    title: {
      running: 'Running Tests...',
      completed: 'Tests Completed',
      cancelled: 'Tests Cancelled',
      unknown: 'Test Status Unknown',
    },
    navigation: {
      homePath: '/benchmarking',
      reportPath: '/benchmarking/report',
    },
    eventType: AppEventTypes.BENCHMARK_UPDATE,
    hooks: {
      useStatusQuery: useGetAllStatusQuery as (
        args?: unknown,
        options?: unknown
      ) => { data: unknown; isLoading: boolean },
      useCancelMutation: useCancelBenchmarkMutation as () => [
        unknown,
        { isLoading: boolean },
      ],
    },
    reduxActions: {
      resetCookbooks: resetBenchmarkCookbooks,
      resetModels: resetBenchmarkModels,
    },
  };
};

// For backward compatibility
export const benchmarkRunStatusConfig: RunStatusConfig =
  createRunStatusConfig();
