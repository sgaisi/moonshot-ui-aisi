import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgenticEndpointSelector } from '@/app/agentic/components/agenticEndpointsSelector';
import { useModelsList } from '@/app/hooks/useLLMEndpointList';

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

const mockModelClickHandler = jest.fn();
const mockEditClickHandler = jest.fn();
const mockCreateClickHandler = jest.fn();

jest.mock('@/app/hooks/useLLMEndpointList', () => ({
  useModelsList: jest.fn(),
}));

describe('AgenticEndpointSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading indicator', () => {
    (useModelsList as jest.Mock).mockImplementation(() => ({
      models: [],
      isLoading: true,
      error: null,
    }));

    render(
      <AgenticEndpointSelector
        totalSelected={0}
        selectedModels={[]}
        onModelClick={mockModelClickHandler}
        onEditClick={mockEditClickHandler}
        onCreateClick={mockCreateClickHandler}
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays agentic endpoints', () => {
    (useModelsList as jest.Mock).mockImplementation(() => ({
      models: mockAgenticEndpoints,
      isLoading: false,
      error: null,
    }));

    render(
      <AgenticEndpointSelector
        totalSelected={0}
        selectedModels={[]}
        onModelClick={mockModelClickHandler}
        onEditClick={mockEditClickHandler}
        onCreateClick={mockCreateClickHandler}
      />
    );

    expect(screen.queryByText(/loading/i)).toBeNull();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(2);
    expect(screen.getByText(mockAgenticEndpoints[0].name)).toBeInTheDocument();
    expect(screen.getByText(mockAgenticEndpoints[1].name)).toBeInTheDocument();
  });

  it('check selected agentic endpoint checkbox', async () => {
    (useModelsList as jest.Mock).mockImplementation(() => ({
      models: mockAgenticEndpoints,
      isLoading: false,
      error: null,
    }));

    render(
      <AgenticEndpointSelector
        totalSelected={1}
        selectedModels={[mockAgenticEndpoints[1]]}
        onModelClick={mockModelClickHandler}
        onEditClick={mockEditClickHandler}
        onCreateClick={mockCreateClickHandler}
      />
    );

    const selectedCheckbox = screen.getByRole('checkbox', {
      name: `Select ${mockAgenticEndpoints[1].name}`,
    });

    expect(selectedCheckbox).toBeChecked();

    await userEvent.click(selectedCheckbox);
    expect(mockModelClickHandler).toHaveBeenCalledWith(mockAgenticEndpoints[1]);
    expect(mockModelClickHandler).toHaveBeenCalledTimes(1);

    const editButtons = screen.queryAllByRole('button', {
      name: /edit/i,
    });

    await userEvent.click(editButtons[0]);

    expect(mockEditClickHandler).toHaveBeenCalledWith(mockAgenticEndpoints[0]);
    expect(mockEditClickHandler).toHaveBeenCalledTimes(1);

    await userEvent.click(
      screen.getByRole('button', {
        name: /create new endpoint/i,
      })
    );

    expect(mockCreateClickHandler).toHaveBeenCalledTimes(1);
  });

  it('displays agentic endpoint selection count', () => {
    (useModelsList as jest.Mock).mockImplementation(() => ({
      models: mockAgenticEndpoints,
      isLoading: false,
      error: null,
    }));

    render(
      <AgenticEndpointSelector
        totalSelected={1}
        selectedModels={[mockAgenticEndpoints[0]]}
        onModelClick={mockModelClickHandler}
        onEditClick={mockEditClickHandler}
        onCreateClick={mockCreateClickHandler}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
