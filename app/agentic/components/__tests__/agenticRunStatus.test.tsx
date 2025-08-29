import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import { getRecipesStatsById } from '@/actions/getRecipesStatsById';
import { AgenticRunStatus } from '@/app/agentic/components/agenticRunStatus';
import { useEventSource } from '@/app/hooks/use-eventsource';
import { useCancelAgenticMutation } from '@/app/services/agentic-api-service';
import { useGetAllStatusQuery } from '@/app/services/status-api-service';
import { TestStatusProgress } from '@/app/types/enums';
import {
  resetAgenticCookbooks,
  resetAgenticModels,
  useAppDispatch,
} from '@/lib/redux';

jest.mock('@/actions/getRecipesStatsById');

jest.mock('@/lib/redux', () => ({
  resetAgenticCookbooks: jest.fn(),
  resetAgenticModels: jest.fn(),
  useAppDispatch: jest.fn(),
}));

const mockTestStatuses: TestStatuses = {
  'agentic-runner-id-1': {
    current_runner_id: 'agentic-runner-id-1',
    current_runner_type: 'agentic',
    current_duration: 180,
    current_status: TestStatusProgress.RUNNING,
    current_cookbook_index: 1,
    current_cookbook_name: 'Agentic Cookbook A',
    current_cookbook_total: 2,
    current_recipe_index: 1,
    current_recipe_name: 'Agentic Recipe A',
    current_recipe_total: 3,
    current_progress: 60,
    current_error_messages: [],
  },
  'agentic-runner-id-2': {
    current_runner_id: 'agentic-runner-id-2',
    current_runner_type: 'agentic',
    current_duration: 450,
    current_status: 'completed',
    current_cookbook_index: 2,
    current_cookbook_name: 'Agentic Cookbook B',
    current_cookbook_total: 2,
    current_recipe_index: 3,
    current_recipe_name: 'Agentic Recipe B',
    current_recipe_total: 3,
    current_progress: 100,
    current_error_messages: [],
  },
};

const USER_INPUT_PERCENTAGE_OF_PROMPTS = 100;
const mockAgenticRunner: Runner = {
  id: 'agentic-runner-id-1',
  name: 'Mock Agentic Runner One',
  endpoints: ['agentic-endpoint-id-1', 'agentic-endpoint-id-2'],
  description: 'Mock description for Agentic Runner One',
  runner_args: {
    cookbooks: ['cb-agentic-1', 'cb-agentic-2'],
    prompt_selection_percentage: USER_INPUT_PERCENTAGE_OF_PROMPTS,
    random_seed: 1,
    system_prompt: '',
    runner_processing_module: 'agentic',
    result_processing_module: 'agentic-result',
  },
  start_time: 1672531200,
};

const mockAgenticCookbooks = [
  {
    id: 'cb-agentic-1',
    name: 'Mock Agentic Cookbook One',
    description: 'Agentic reasoning test cookbook',
    recipes: ['rc-agentic-1'],
    total_prompt_in_cookbook: 20,
  },
  {
    id: 'cb-agentic-2',
    name: 'Mock Agentic Cookbook Two',
    description: 'Agentic tool-usage test cookbook',
    recipes: ['rc-agentic-2'],
    total_prompt_in_cookbook: 25,
  },
];

const mockAgenticEndpoints: LLMEndpoint[] = [
  {
    id: 'agentic-endpoint-id-1',
    connector_type: 'openai',
    name: 'Agentic Endpoint 1',
    uri: 'http://agentic-endpoint1.com',
    token: 'agentic-token1',
    max_calls_per_second: 10,
    max_concurrency: 5,
    created_date: '2023-01-01',
    params: { model: 'gpt-4', temperature: 0.7 },
  },
  {
    id: 'agentic-endpoint-id-2',
    connector_type: 'anthropic',
    name: 'Agentic Endpoint 2',
    uri: 'http://agentic-endpoint2.com',
    token: 'agentic-token2',
    max_calls_per_second: 15,
    max_concurrency: 8,
    created_date: '2023-02-01',
    params: { model: 'claude-3', temperature: 0.5 },
  },
];

jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockImplementation(jest.fn()),
  useSearchParams: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
  })),
}));

jest.mock('@/app/hooks/use-eventsource', () => ({
  useEventSource: jest.fn(),
}));

jest.mock('@/app/services/agentic-api-service', () => ({
  useCancelAgenticMutation: jest
    .fn()
    .mockReturnValue([jest.fn(), { isLoading: false }]),
}));

jest.mock('@/app/services/agentic-status-api-service', () => ({
  useGetAgenticStatusQuery: jest.fn().mockReturnValue({
    data: {},
    isLoading: false,
  }),
}));

jest.mock('@/app/services/cookbook-api-service', () => ({
  useGetCookbooksQuery: () => ({ data: [mockAgenticCookbooks[1]] }),
}));

jest.mock('@/app/services/llm-endpoint-api-service', () => ({
  useGetLLMEndpointsQuery: () => ({ data: mockAgenticEndpoints }),
}));

jest.mock('@/app/services/runner-api-service', () => ({
  useGetRunnerByIdQuery: () => ({ data: mockAgenticRunner, isLoading: false }),
}));

jest.mock('@/app/services/status-api-service', () => ({
  useGetAllStatusQuery: jest.fn(),
}));

jest.mock('@/app/hooks/useIsResponsiveBreakpoint', () => ({
  useIsResponsiveBreakpoint: jest.fn().mockReturnValue('lg'),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockRecipesStats: RecipeStats[] = [
  {
    num_of_datasets_prompts: {
      dataset1: 100,
      dataset2: 200,
    },
    num_of_tags: 3,
    num_of_datasets: 2,
    num_of_prompt_templates: 0,
    num_of_metrics: 2,
    num_of_attack_modules: 1,
  },
];

beforeAll(() => {
  (getRecipesStatsById as jest.Mock).mockResolvedValue({
    status: 'success',
    data: mockRecipesStats,
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

it('should display the "in progress" status and agentic test details', async () => {
  const mockCloseEventSource = jest.fn();
  (useEventSource as jest.Mock).mockReturnValue([null, mockCloseEventSource]);
  (useSearchParams as jest.Mock).mockReturnValue({
    get: () => mockAgenticRunner.id,
  });
  (useGetAllStatusQuery as jest.Mock).mockImplementation(() => ({
    data: mockTestStatuses,
    isLoading: false,
  }));

  // Import the mock and update it for this test
  const { useGetAgenticStatusQuery } = jest.requireMock(
    '@/app/services/agentic-status-api-service'
  );
  (useGetAgenticStatusQuery as jest.Mock).mockReturnValue({
    data: mockTestStatuses,
    isLoading: false,
  });
  const mockDispatch = jest.fn();
  (useAppDispatch as jest.Mock).mockImplementation(() => mockDispatch);
  const mockResetAgenticCookbooks = jest.fn();
  const mockResetAgenticModels = jest.fn();
  (resetAgenticCookbooks as unknown as jest.Mock).mockImplementation(
    mockResetAgenticCookbooks
  );
  (resetAgenticModels as unknown as jest.Mock).mockImplementation(
    mockResetAgenticModels
  );
  render(<AgenticRunStatus allStatuses={mockTestStatuses} />);

  expect(mockDispatch).toHaveBeenCalledTimes(2);
  expect(mockDispatch).toHaveBeenCalledWith(mockResetAgenticCookbooks());
  expect(mockDispatch).toHaveBeenCalledWith(mockResetAgenticModels());

  expect(screen.getByText(/Running Agentic Tests/i)).toBeInTheDocument();
  expect(
    screen.getByText(
      new RegExp(
        `${mockTestStatuses[mockAgenticRunner.id].current_progress.toString()}%`,
        'i'
      )
    )
  ).toBeInTheDocument();

  await userEvent.click(screen.getByText(/see details/i));
  expect(screen.getByText(mockAgenticRunner.name)).toBeInTheDocument();

  // Test agentic-specific endpoint display
  for (const endpoint of mockAgenticRunner.endpoints) {
    expect(
      screen.getByText(
        mockAgenticEndpoints.find((e) => e.id === endpoint)?.name as string
      )
    ).toBeInTheDocument();
  }

  cleanup();
  expect(mockCloseEventSource).toHaveBeenCalled();
});

const mockDispatch = jest.fn();
(useAppDispatch as jest.Mock).mockImplementation(() => mockDispatch);
const mockResetAgenticCookbooks = jest.fn();
const mockResetAgenticModels = jest.fn();
(resetAgenticCookbooks as unknown as jest.Mock).mockImplementation(
  mockResetAgenticCookbooks
);
(resetAgenticModels as unknown as jest.Mock).mockImplementation(
  mockResetAgenticModels
);

it('should display the "completed" status for agentic tests', async () => {
  const completedAgenticTestData = {
    current_runner_id: 'agentic-runner-id-1',
    current_runner_type: 'agentic',
    current_duration: 300,
    current_status: TestStatusProgress.COMPLETED,
    current_cookbook_index: 2,
    current_cookbook_name: 'Agentic Cookbook A',
    current_cookbook_total: 2,
    current_recipe_index: 3,
    current_recipe_name: 'Agentic Recipe A',
    current_recipe_total: 3,
    current_progress: 100,
    current_error_messages: [],
  };
  const mockCloseEventSource = jest.fn();
  (useSearchParams as jest.Mock).mockReturnValue({
    get: () => mockAgenticRunner.id,
  });
  (useGetAllStatusQuery as jest.Mock).mockImplementation(() => ({
    data: mockTestStatuses,
    isLoading: false,
  }));

  // Import the mock and update it for this test
  const { useGetAgenticStatusQuery } = jest.requireMock(
    '@/app/services/agentic-status-api-service'
  );
  (useGetAgenticStatusQuery as jest.Mock).mockReturnValue({
    data: mockTestStatuses,
    isLoading: false,
  });
  const { rerender } = render(
    <AgenticRunStatus allStatuses={mockTestStatuses} />
  );

  // Simulate an update to useEventSource and trigger re-render
  await act(async () => {
    (useEventSource as jest.Mock).mockReturnValue([
      completedAgenticTestData,
      mockCloseEventSource,
    ]);
    rerender(<AgenticRunStatus allStatuses={mockTestStatuses} />);
  });
  expect(screen.getByText(/tests completed/i)).toBeInTheDocument();
  expect(
    screen.getByText(
      new RegExp(
        `${completedAgenticTestData.current_progress.toString()}%`,
        'i'
      )
    )
  ).toBeInTheDocument();
});

it('should display the "cancelled" status for agentic tests', async () => {
  const cancelledAgenticTestData = {
    current_runner_id: 'agentic-runner-id-1',
    current_runner_type: 'agentic',
    current_duration: 180,
    current_status: TestStatusProgress.CANCELLED,
    current_cookbook_index: 1,
    current_cookbook_name: 'Agentic Cookbook A',
    current_cookbook_total: 2,
    current_recipe_index: 1,
    current_recipe_name: 'Agentic Recipe A',
    current_recipe_total: 3,
    current_progress: 30,
    current_error_messages: [],
  };
  const mockCloseEventSource = jest.fn();
  (useSearchParams as jest.Mock).mockReturnValue({
    get: () => mockAgenticRunner.id,
  });
  const mockTriggerCancelAgentic = jest.fn();
  (useCancelAgenticMutation as jest.Mock).mockReturnValue([
    mockTriggerCancelAgentic,
    { isLoading: false },
  ]);
  (useGetAllStatusQuery as jest.Mock).mockImplementation(() => ({
    data: mockTestStatuses,
    isLoading: false,
  }));

  // Import the mock and update it for this test
  const { useGetAgenticStatusQuery } = jest.requireMock(
    '@/app/services/agentic-status-api-service'
  );
  (useGetAgenticStatusQuery as jest.Mock).mockReturnValue({
    data: mockTestStatuses,
    isLoading: false,
  });
  const { rerender } = render(
    <AgenticRunStatus allStatuses={mockTestStatuses} />
  );
  const cancelButton = screen.getByRole('button', { name: /cancel/i });
  await userEvent.click(cancelButton);
  expect(mockTriggerCancelAgentic).toHaveBeenCalled();
  expect(cancelButton).toBeDisabled();

  // Simulate an update to useEventSource and trigger re-render
  await act(async () => {
    (useEventSource as jest.Mock).mockReturnValue([
      cancelledAgenticTestData,
      mockCloseEventSource,
    ]);
    rerender(<AgenticRunStatus allStatuses={mockTestStatuses} />);
  });
  expect(screen.getByText(/tests cancelled/i)).toBeInTheDocument();
});

it('should display the "errored" status for agentic tests', async () => {
  const erroredAgenticTestData = {
    current_runner_id: 'agentic-runner-id-1',
    current_runner_type: 'agentic',
    current_duration: 240,
    current_status: TestStatusProgress.ERRORS,
    current_cookbook_index: 1,
    current_cookbook_name: 'Agentic Cookbook A',
    current_cookbook_total: 2,
    current_recipe_index: 2,
    current_recipe_name: 'Agentic Recipe A',
    current_recipe_total: 3,
    current_progress: 100,
    current_error_messages: ['Mock agentic error message 1'],
  };
  const mockCloseEventSource = jest.fn();
  (useSearchParams as jest.Mock).mockReturnValue({
    get: () => mockAgenticRunner.id,
  });
  (useGetAllStatusQuery as jest.Mock).mockImplementation(() => ({
    data: mockTestStatuses,
    isLoading: false,
  }));

  // Import the mock and update it for this test
  const { useGetAgenticStatusQuery } = jest.requireMock(
    '@/app/services/agentic-status-api-service'
  );
  (useGetAgenticStatusQuery as jest.Mock).mockReturnValue({
    data: mockTestStatuses,
    isLoading: false,
  });
  const { rerender } = render(
    <AgenticRunStatus allStatuses={mockTestStatuses} />
  );

  // Simulate an update to useEventSource and trigger re-render
  await act(async () => {
    (useEventSource as jest.Mock).mockReturnValue([
      erroredAgenticTestData,
      mockCloseEventSource,
    ]);
    rerender(<AgenticRunStatus allStatuses={mockTestStatuses} />);
  });
  expect(screen.getByText(/tests completed/i)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /view errors/i }));
  expect(
    screen.getByText(erroredAgenticTestData.current_error_messages[0])
  ).toBeInTheDocument();
});
