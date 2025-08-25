import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormState, useFormStatus } from 'react-dom';
import { createAgenticRun } from '@/actions/createAgenticRun';
import { AgenticNewSessionFlow } from '@/app/agentic/components/agenticNewSessionFlow';
import { flowSteps } from '@/app/agentic/components/agenticNewSessionFlowReducer';
import { useModelsList } from '@/app/hooks/useLLMEndpointList';
import { useGetCookbooksQuery } from '@/app/services/cookbook-api-service';
import { useAppDispatch, useAppSelector } from '@/lib/redux';

const mockAgenticCookbooks: Cookbook[] = [
  {
    id: 'cb-agentic-1',
    name: 'Mock Agentic Cookbook One',
    description: 'Agentic reasoning test cookbook',
    recipes: ['rc-agentic-1'],
    total_prompt_in_cookbook: 20,
    total_dataset_in_cookbook: 2,
    required_config: null,
    tags: ['agentic', 'reasoning'],
  },
  {
    id: 'cb-agentic-2',
    name: 'Mock Agentic Cookbook Two',
    description: 'Agentic tool-usage test cookbook',
    recipes: ['rc-agentic-2'],
    total_prompt_in_cookbook: 30,
    total_dataset_in_cookbook: 3,
    required_config: {
      configurations: {
        embeddings: ['embed-endpoint-1', 'endpoint-2'],
      },
      endpoints: ['agentic-endpoint-id-1'],
    },
    tags: ['agentic', 'tools'],
  },
];

const mockAgenticEndpoints: LLMEndpoint[] = [
  {
    id: 'agentic-1',
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
    id: 'agentic-2',
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

jest.mock('react-dom', () => {
  const actualReactDomApis = jest.requireActual('react-dom');
  return {
    ...actualReactDomApis,
    useFormState: jest.fn(),
    useFormStatus: jest.fn(),
  };
});

jest.mock('@/lib/redux', () => ({
  addAgenticModels: jest.fn(),
  addAgenticCookbooks: jest.fn(),
  removeAgenticModels: jest.fn(),
  resetAgenticCookbooks: jest.fn(),
  resetAgenticModels: jest.fn(),
  updateAgenticCookbooks: jest.fn(),
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/app/services/cookbook-api-service', () => ({
  useGetCookbooksQuery: jest.fn(),
}));
jest.mock('@/app/hooks/useLLMEndpointList', () => ({
  useModelsList: jest.fn(),
}));
jest.mock('@/app/services/connector-api-service', () => ({
  useGetAllConnectorsQuery: jest.fn(),
}));
jest.mock('@/app/services/llm-endpoint-api-service', () => ({
  useCreateLLMEndpointMutation: jest.fn(),
  useUpdateLLMEndpointMutation: jest.fn(),
}));

jest.mock('@/actions/createAgenticRun');

const mockFormState: FormState<AgenticRunFormValues> = {
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
};

//We are not asserting anything on the form action. In React, form action is a reference to a function (server action). There is no way to stub the action.
//Set it to a string to suppress jest from reporting invalid value prop error.
const mockFormAction = 'unused';

const mockDispatch = jest.fn();

beforeAll(() => {
  const mockUseFormState: jest.Mock = jest.fn().mockImplementation(() => {
    return [
      mockFormState,
      mockFormAction, // use a dummy string to prevent jest from complaining
    ];
  });
  (useFormState as jest.Mock).mockImplementation(mockUseFormState);
  (useFormStatus as jest.Mock).mockImplementation(() => ({ pending: false }));
  (createAgenticRun as jest.Mock).mockResolvedValue({
    status: 'success',
  });
  (useGetCookbooksQuery as jest.Mock).mockReturnValue({
    data: mockAgenticCookbooks,
    isFetching: false,
  });
  (useModelsList as jest.Mock).mockImplementation(() => ({
    models: mockAgenticEndpoints,
    isLoading: false,
    error: null,
  }));
  (useAppDispatch as jest.Mock).mockImplementation(() => jest.fn());
});

beforeEach(() => {
  mockDispatch.mockReset();
  (useAppDispatch as jest.Mock).mockImplementation(() => mockDispatch);
});

it('should show correct views when next or back icons are clicked (No cookbooks with required endpoints selected)', async () => {
  (useAppSelector as jest.Mock).mockImplementation(() => []); //simulate no cookbooks or endpoints selected
  const { rerender } = render(<AgenticNewSessionFlow />);
  const nextButton = screen.getByRole('button', { name: /Next View/i });
  expect(nextButton).toBeDisabled();

  const steps = screen.queryAllByRole('step');
  expect(steps).toHaveLength(3);
  flowSteps.forEach((flowStep, index) => {
    expect(steps[index].textContent).toEqual(flowStep);
  });

  // endpoints selection screen
  expect(
    screen.getByRole('step', { name: `Step - ${flowSteps[0]}` }).className
  ).toMatch(/active/);

  for (const endpoint of mockAgenticEndpoints) {
    expect(screen.getByText(endpoint.name)).toBeInTheDocument();
  }

  await userEvent.click(
    screen.getByRole('checkbox', {
      name: `Select ${mockAgenticEndpoints[0].name}`,
    })
  );

  // simulate 1 endpoint selected after clicking the select endpoint checkbox above, and rerender the component for further assertions
  await act(async () => {
    (useAppSelector as jest.Mock).mockReset();
    let callCount = 1; // relying on the call counter to return the expected value
    // in AgenticNewSessionFlow, useAppSelector is called twice to get selectedCookbooks first and then, selectedModels
    (useAppSelector as jest.Mock).mockImplementation(() => {
      if (callCount === 1) {
        callCount++;
        return []; // simulate no cookbooks selected
      }
      callCount--;
      return [mockAgenticEndpoints[0]]; // simulate mockAgenticEndpoints[0] selected
    });
    rerender(<AgenticNewSessionFlow />);
  });

  expect(nextButton).toBeEnabled();
  await userEvent.click(nextButton);

  // cookbooks selection screen
  expect(
    screen.getByRole('step', { name: `Step - ${flowSteps[1]}` }).className
  ).toMatch(/active/);

  for (const cookbook of mockAgenticCookbooks) {
    expect(screen.getByText(cookbook.name)).toBeInTheDocument();
  }

  expect(nextButton).toBeDisabled();
  const backButton = screen.getByRole('button', { name: /Previous View/i });
  expect(backButton).toBeEnabled();

  await userEvent.click(
    screen.getByRole('checkbox', {
      name: `Select ${mockAgenticCookbooks[0].id}`,
    })
  );
  expect(nextButton).toBeEnabled();

  // simulate 1 endpoint selected and 1 cookbook selected after clicking the select cookbook checkbox above, before clicking next button which will rerender the component
  (useAppSelector as jest.Mock).mockReset();
  let callCount = 1; // relying on the call counter to return the expected value
  // in AgenticNewSessionFlow, useAppSelector is called twice to get selectedCookbooks first and then, selectedModels
  (useAppSelector as jest.Mock).mockImplementation(() => {
    if (callCount === 1) {
      callCount++;
      return [mockAgenticCookbooks[0]]; // simulate mockAgenticCookbooks[0] selected
    }
    callCount--;
    return [mockAgenticEndpoints[0]]; // simulate mockAgenticEndpoints[0] selected
  });

  await userEvent.click(nextButton);

  // run form screen
  expect(
    screen.getByRole('step', { name: `Step - ${flowSteps[2]}` }).className
  ).toMatch(/active/);
  expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /next view/i })).toBeNull();

  // Test agentic-specific content
  expect(screen.getByText('Agentic Configuration')).toBeInTheDocument();
  expect(screen.getByText('agentic')).toBeInTheDocument();

  // prepare to go back
  const prevButton = screen.getByRole('button', { name: /Previous View/i });

  await userEvent.click(prevButton);

  // back at cookbooks selection screen
  expect(
    screen.getByRole('checkbox', {
      name: `Select ${mockAgenticCookbooks[0].id}`,
    })
  ).toBeChecked();

  await userEvent.click(prevButton);

  // endpoints selection screen
  for (const endpoint of mockAgenticEndpoints) {
    expect(screen.getByText(endpoint.name)).toBeInTheDocument();
  }
});
