import { MenuItem } from '@/app/components/testingHomePage';
import { CookbookSelectorConfig } from '@/app/components/cookbookSelector/cookbookSelector';
import { RunFormConfig } from '@/app/components/runForm';
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

// Category descriptions including agentic support
const categoryDescriptions = {
  capability:
    "Capability assesses the AI model's ability to perform within the context of the unique requirements and challenges of a particular domain or task.",
  trustAndSafety:
    'Trust & Safety addresses the reliability, ethical considerations, and inherent risks of the AI model. It also examines potential scenarios where the AI system could be used maliciously or unethically.',
  agentic:
    'Agentic cookbooks contain AISI Joint Testing datasets designed specifically for evaluating AI models in autonomous, multi-step reasoning scenarios.',
  others:
    'Other available cookbooks that can be used for benchmarking. Select the cookbooks that best fit your testing requirements.',
};

// Simple function to add agentic tab to existing cookbook tabs
const createTabsWithAgentic = (): TabItem<string[]>[] => {
  const agenticTab: TabItem<string[]> = {
    id: 'agentic',
    label: 'Agentic',
    data: [],
  };
  return [...config.cookbookCategoriesTabs, agenticTab];
};

export const benchmarkCookbookSelectorConfig: CookbookSelectorConfig = {
  mode: 'benchmark',
  tabItems: createTabsWithAgentic(),
  categoryDescriptions: categoryDescriptions,
  reduxSelector: (state: Record<string, unknown>) =>
    (state as { benchmarkCookbooks: { entities: Cookbook[] } })
      .benchmarkCookbooks.entities,
  reduxActions: {
    add: addBenchmarkCookbooks,
    remove: removeBenchmarkCookbooks,
    update: updateBenchmarkCookbooks,
  },
};

// Simplified RunForm configuration focused on benchmarking
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

// Simplified RunStatus configuration focused on benchmarking
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
