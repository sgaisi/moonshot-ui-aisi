import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormState, useFormStatus } from 'react-dom';
import { createAgenticRun } from '@/actions/createAgenticRun';
import AgenticRunForm from '@/app/agentic/components/agenticRunForm';

jest.mock('react-dom', () => {
  const actualReactDom = jest.requireActual('react-dom');
  return {
    ...actualReactDom,
    useFormState: jest.fn(),
    useFormStatus: jest.fn(),
  };
});

jest.mock('@/actions/createAgenticRun');

const mockCookbooks: Cookbook[] = [
  {
    id: 'cb-agentic-1',
    name: 'Mock Agentic Cookbook One',
    description: 'Mock agentic test description',
    recipes: ['rc-agentic-1'],
    total_prompt_in_cookbook: 15,
    total_dataset_in_cookbook: 2,
    required_config: {
      configurations: {
        embeddings: ['embed-endpoint-1', 'endpoint-2'],
      },
      endpoints: ['endpoint-1', 'endpoint-2'],
    },
  },
  {
    id: 'cb-agentic-2',
    name: 'Mock Agentic Cookbook Two',
    description: 'Mock agentic test description',
    recipes: ['rc-agentic-2'],
    total_prompt_in_cookbook: 25,
    total_dataset_in_cookbook: 3,
    required_config: null,
  },
];

const mockEndpoints: LLMEndpoint[] = [
  {
    id: 'ep-agentic-1',
    connector_type: 'openai',
    name: 'Mock Agentic Endpoint One',
    uri: 'http://mock-agentic-endpoint-one.com',
    token: 'mock-agentic-token-1',
    max_calls_per_second: 10,
    max_concurrency: 5,
    created_date: '2023-01-01T00:00:00Z',
    params: {
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 1000,
    },
  },
  {
    id: 'ep-agentic-2',
    connector_type: 'anthropic',
    name: 'Mock Agentic Endpoint Two',
    uri: 'http://mock-agentic-endpoint-two.com',
    token: 'mock-agentic-token-2',
    max_calls_per_second: 15,
    max_concurrency: 8,
    created_date: '2023-01-02T00:00:00Z',
    params: {
      model: 'claude-3',
      temperature: 0.5,
      max_tokens: 1500,
    },
  },
];

describe('AgenticRunForm', () => {
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

  beforeAll(() => {
    const mockUseFormState: jest.Mock = jest.fn().mockImplementation(() => {
      return [
        mockFormState,
        mockFormAction, // use a dummy string to prevent jest from complaining
      ];
    });
    (useFormState as jest.Mock).mockImplementation(mockUseFormState);
    (useFormStatus as jest.Mock).mockImplementation(() => ({ pending: false }));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form initial state and display agentic configuration', async () => {
    const { container } = render(
      <AgenticRunForm
        selectedCookbooks={mockCookbooks}
        selectedEndpoints={mockEndpoints}
      />
    );
    const form = container.querySelector('form');
    expect(form).toHaveFormValues({
      prompt_selection_percentage: Number(
        mockFormState.prompt_selection_percentage
      ),
      inputs: mockCookbooks.map((cb) => cb.id),
      endpoints: mockEndpoints.map((ep) => ep.id),
      random_seed: Number(mockFormState.random_seed),
      runner_processing_module: mockFormState.runner_processing_module,
      system_prompt: mockFormState.system_prompt,
      run_all: true,
    });
    const runBtn = screen.getByRole('button', { name: /Run/i });
    expect(runBtn).toBeDisabled();

    // Test agentic-specific configuration display
    expect(screen.getByText('Agentic Configuration')).toBeInTheDocument();
    expect(screen.getByText('Processing Module:')).toBeInTheDocument();
    expect(screen.getByText('agentic')).toBeInTheDocument();
    expect(screen.getByText('Run Iteration:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Selected Cookbooks:')).toBeInTheDocument();
    expect(screen.getByText('Selected Endpoints:')).toBeInTheDocument();
    // Check that both cookbook and endpoint counts are displayed (they both show "2")
    expect(screen.getAllByText('2')).toHaveLength(2);

    await userEvent.type(screen.getByLabelText(/Name/i), 'Test Agentic Run');
    expect(runBtn).toBeEnabled();
  });

  it('should display correct "Run a smaller set" totals', async () => {
    const { container } = render(
      <AgenticRunForm
        selectedCookbooks={mockCookbooks}
        selectedEndpoints={mockEndpoints}
      />
    );
    const hiddenPercentInputField = container.querySelector(
      'input[name="prompt_selection_percentage"]'
    ) as HTMLInputElement;
    hiddenPercentInputField.style.display = 'block'; // temporarily unhide percent input for testing
    await userEvent.type(screen.getByLabelText(/Name/i), 'Test Agentic Run');
    await userEvent.clear(hiddenPercentInputField);
    await userEvent.type(hiddenPercentInputField, '50');

    const form = container.querySelector('form');
    expect(form).toHaveFormValues({
      prompt_selection_percentage: 50,
      inputs: mockCookbooks.map((cb) => cb.id),
      endpoints: mockEndpoints.map((ep) => ep.id),
      random_seed: Number(mockFormState.random_seed),
      runner_processing_module: mockFormState.runner_processing_module,
      system_prompt: mockFormState.system_prompt,
      run_all: true, // Note: run_all stays true in form even when percentage changes
    });
    hiddenPercentInputField.style.display = 'none';
    expect(screen.getByRole('button', { name: /Run/i })).toBeEnabled();
    expect(
      screen.getByText('Prompts will be run at 50% selection')
    ).toBeInTheDocument();
  });

  it('should display form errors', async () => {
    const { rerender } = render(
      <AgenticRunForm
        selectedCookbooks={mockCookbooks}
        selectedEndpoints={mockEndpoints}
      />
    );

    await act(async () => {
      (useFormStatus as jest.Mock).mockImplementation(() => ({
        pending: true,
      }));
      rerender(
        <AgenticRunForm
          selectedCookbooks={mockCookbooks}
          selectedEndpoints={mockEndpoints}
        />
      );
    });

    const mockFormStateWithErrors: FormState<AgenticRunFormValues> = {
      ...mockFormState,
      formStatus: 'error',
      formErrors: {
        run_name: ['Agentic run name error'],
        prompt_selection_percentage: ['Percentage error'],
        description: ['Description error'],
      },
    };
    await act(async () => {
      const mockUseFormState: jest.Mock = jest.fn().mockImplementation(() => {
        return [
          mockFormStateWithErrors,
          mockFormAction, // use a dummy string to prevent jest from complaining
        ];
      });
      (useFormState as jest.Mock).mockImplementation(mockUseFormState);
      rerender(
        <AgenticRunForm
          selectedCookbooks={mockCookbooks}
          selectedEndpoints={mockEndpoints}
        />
      );
    });
    expect(screen.getAllByText('Agentic run name error')).toHaveLength(2);
    expect(screen.getAllByText('Percentage error')).toHaveLength(1);
    expect(screen.getAllByText('Description error')).toHaveLength(2);
  });

  it('should toggle between "Run All" and percentage modes', async () => {
    render(
      <AgenticRunForm
        selectedCookbooks={mockCookbooks}
        selectedEndpoints={mockEndpoints}
      />
    );

    // Should start in "Run All" mode
    expect(
      screen.getByText('Prompts will be run at 100% selection')
    ).toBeInTheDocument();

    // Toggle to percentage mode
    const toggleSwitch = screen.getByRole('toggle-switch');
    await userEvent.click(toggleSwitch);

    // Should show percentage mode
    expect(
      screen.getByText('Prompts will be run at 1% selection')
    ).toBeInTheDocument();
  });
});
