import { MenuItem } from '@/app/components/testingHomePage';
import { CookbookSelectorConfig } from '@/app/components/cookbookSelector/cookbookSelector';
import { RunFormConfig } from '@/app/components/runForm';
import { RunsViewConfig } from '@/app/components/runsView';
import { RunStatusConfig } from '@/app/components/runStatus/runStatus';
import { IconName } from '@/app/components/IconSVG';
import { TabItem } from '@/app/components/tabsMenu';
import {
  addAgenticCookbooks,
  removeAgenticCookbooks,
  updateAgenticCookbooks,
  addBenchmarkCookbooks,
  removeBenchmarkCookbooks,
  updateBenchmarkCookbooks,
  resetAgenticCookbooks,
  resetAgenticModels,
  resetBenchmarkCookbooks,
  resetBenchmarkModels,
} from '@/lib/redux';
import { createAgenticRun } from '@/actions/createAgenticRun';
import { createRun } from '@/actions/createRun';
import { useCancelAgenticMutation } from '@/app/services/agentic-api-service';
import { useGetAgenticStatusQuery } from '@/app/services/agentic-status-api-service';
import { useCancelBenchmarkMutation } from '@/app/services/benchmark-api-service';
import { useGetAllStatusQuery } from '@/app/services/status-api-service';
import { AppEventTypes } from '@/app/types/enums';
import config from '@/moonshot.config';

export const agenticConfig: { title: string; menuItems: MenuItem[] } = {
  title: 'agentic testing with moonshot',
  menuItems: [
    {
      href: '/agentic/session/new?skip_topics=true',
      text: 'Start New Run',
      iconName: IconName.CheckList,
    },
    {
      href: '/agentic/runs',
      text: 'View Past Runs',
      iconName: IconName.HistoryClock,
    },
  ],
};

export const benchmarkingConfig: { title: string; menuItems: MenuItem[] } = {
  title: 'benchmark with moonshot',
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

// Cookbook selector configurations
const agenticTabItems: TabItem<string[]>[] = [
  { id: 'agentic', label: 'Agentic Cookbooks', data: [] },
];

const agenticCategoryDescriptions = {
  agentic:
    'Agentic cookbooks contain AISI Joint Testing datasets designed specifically for evaluating AI models in autonomous, multi-step reasoning scenarios.',
};

const benchmarkCategoryDescriptions = {
  capability:
    "Capability assesses the AI model's ability to perform within the context of the unique requirements and challenges of a particular domain or task.",
  trustAndSafety:
    'Trust & Safety addresses the reliability, ethical considerations, and inherent risks of the AI model. It also examines potential scenarios where the AI system could be used maliciously or unethically.',
  others:
    'Other available cookbooks that can be used for benchmarking. Select the cookbooks that best fit your testing requirements.',
};

export const agenticCookbookSelectorConfig: CookbookSelectorConfig = {
  mode: 'agentic',
  tabItems: agenticTabItems,
  categoryDescriptions: agenticCategoryDescriptions,
  reduxSelector: (state: Record<string, unknown>) =>
    (state as { agenticCookbooks: { entities: Cookbook[] } }).agenticCookbooks
      .entities,
  reduxActions: {
    add: addAgenticCookbooks,
    remove: removeAgenticCookbooks,
    update: updateAgenticCookbooks,
  },
};

export const benchmarkCookbookSelectorConfig: CookbookSelectorConfig = {
  mode: 'benchmark',
  tabItems: config.cookbookCategoriesTabs,
  categoryDescriptions: benchmarkCategoryDescriptions,
  reduxSelector: (state: Record<string, unknown>) =>
    (state as { benchmarkCookbooks: { entities: Cookbook[] } })
      .benchmarkCookbooks.entities,
  reduxActions: {
    add: addBenchmarkCookbooks,
    remove: removeBenchmarkCookbooks,
    update: updateBenchmarkCookbooks,
  },
};

// RunForm configurations
export const agenticRunFormConfig: RunFormConfig = {
  mode: 'agentic',
  formAction: createAgenticRun as (
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
    prompt_selection_percentage: '100',
    system_prompt: '',
    runner_processing_module: 'agentic',
    random_seed: '1',
  },
  placeholders: {
    name: 'Give this agentic session a unique name',
    description: 'Description of this agentic run',
  },
  defaultPercentage: 100,
};

export const benchmarkRunFormConfig: RunFormConfig = {
  mode: 'benchmark',
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
    runner_processing_module: 'benchmarking',
    random_seed: '0',
  },
  placeholders: {
    name: 'Give this session a unique name',
    description: 'Description of this benchmark run',
  },
  defaultPercentage: 1,
};

// RunsView configurations
export const agenticRunsViewConfig: RunsViewConfig = {
  mode: 'agentic',
  title: 'Past Agentic Runs',
  newSessionPath: '/agentic/session/new',
  reportPath: '/agentic/report',
  noRunnersErrorText: 'No past agentic runs found',
};

export const benchmarkRunsViewConfig: RunsViewConfig = {
  mode: 'benchmark',
  title: 'Past Benchmark Runs',
  newSessionPath: '/benchmarking/session/new',
  reportPath: '/benchmarking/report',
  noRunnersErrorText: 'No past runs found',
};

// RunStatus configurations
export const agenticRunStatusConfig: RunStatusConfig = {
  mode: 'agentic',
  title: {
    running: 'Running Agentic Tests...',
    completed: 'Agentic Tests Completed',
    cancelled: 'Agentic Tests Cancelled',
    unknown: 'Agentic Test Status Unknown',
  },
  navigation: {
    homePath: '/agentic',
    reportPath: '/agentic/report',
  },
  eventType: AppEventTypes.AGENTIC_UPDATE,
  hooks: {
    useStatusQuery: useGetAgenticStatusQuery as (
      args?: unknown,
      options?: unknown
    ) => { data: unknown; isLoading: boolean },
    useCancelMutation: useCancelAgenticMutation as () => [
      unknown,
      { isLoading: boolean },
    ],
  },
  reduxActions: {
    resetCookbooks: resetAgenticCookbooks,
    resetModels: resetAgenticModels,
  },
};

export const benchmarkRunStatusConfig: RunStatusConfig = {
  mode: 'benchmark',
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
