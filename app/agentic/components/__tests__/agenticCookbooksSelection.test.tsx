import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgenticCookbooksSelection } from '@/app/agentic/components/agenticCookbooksSelection';
import { CookbooksProvider } from '@/app/benchmarking/contexts/cookbooksContext';
import { useGetCookbooksQuery } from '@/app/services/cookbook-api-service';
import { useGetAllRecipesQuery } from '@/app/services/recipe-api-service';
import {
  addAgenticCookbooks,
  removeAgenticCookbooks,
  updateAgenticCookbooks,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';

jest.mock('@/app/services/recipe-api-service', () => ({
  useGetAllRecipesQuery: jest.fn(),
}));

jest.mock('@/moonshot.config', () => ({
  __esModule: true,
  default: {
    ...jest.requireActual('@/moonshot.config').default,
    cookbooksOrder: ['cb-agentic-2', 'cb-agentic-3'],
  },
}));

jest.mock('@/lib/redux', () => ({
  addAgenticCookbooks: jest.fn(),
  removeAgenticCookbooks: jest.fn(),
  updateAgenticCookbooks: jest.fn(),
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('@/app/services/cookbook-api-service', mockCookbookApiService);

function mockCookbookApiService() {
  return {
    useGetCookbooksQuery: jest.fn(),
  };
}

const mockAgenticCookbooks: Cookbook[] = [
  {
    id: 'cb-agentic-1',
    name: 'Mock Agentic Cookbook One',
    description: 'Agentic reasoning test cookbook',
    recipes: ['rc-agentic-1'],
    total_prompt_in_cookbook: 20,
    total_dataset_in_cookbook: 2,
    required_config: {
      configurations: {
        embeddings: ['embed-endpoint-1', 'endpoint-2'],
      },
      endpoints: ['endpoint-1', 'endpoint-2'],
    },
    tags: ['agentic', 'reasoning'],
  },
  {
    id: 'cb-agentic-2',
    name: 'Mock Agentic Cookbook Two',
    description: 'Agentic tool-usage test cookbook',
    recipes: ['rc-agentic-2'],
    total_prompt_in_cookbook: 30,
    total_dataset_in_cookbook: 3,
    required_config: null,
    tags: ['agentic', 'tools'],
  },
  {
    id: 'cb-agentic-3',
    name: 'Mock Agentic Cookbook Three',
    description: 'Agentic planning test cookbook',
    recipes: ['rc-agentic-3'],
    total_prompt_in_cookbook: 25,
    total_dataset_in_cookbook: 2,
    required_config: null,
    tags: ['agentic', 'planning'],
  },
];

function renderWithProviders(
  ui: React.ReactNode,
  { initialCookbooks = [], ...options }: { initialCookbooks?: Cookbook[] } = {}
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <CookbooksProvider initialCookbooks={initialCookbooks}>
      {children}
    </CookbooksProvider>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}

describe('AgenticCookbooksSelection', () => {
  const mockDispatch = jest.fn();
  const mockOnCookbookSelected = jest.fn();
  const mockOnCookbookUnselected = jest.fn();
  const mockOnCookbookAboutClick = jest.fn();
  const mockOnCookbookAboutClose = jest.fn();
  const mockAddAgenticCookbooks = jest.fn();
  const mockUpdateAgenticCookbooks = jest.fn();

  beforeAll(() => {
    function useMockGetCookbooksQuery() {
      return {
        data: mockAgenticCookbooks,
        isFetching: false,
      };
    }

    (useAppDispatch as jest.Mock).mockImplementation(() => mockDispatch);
    (addAgenticCookbooks as unknown as jest.Mock).mockImplementation(
      mockAddAgenticCookbooks
    );
    (useGetCookbooksQuery as jest.Mock).mockImplementation(
      useMockGetCookbooksQuery
    );
    (updateAgenticCookbooks as unknown as jest.Mock).mockImplementation(
      mockUpdateAgenticCookbooks
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display agentic cookbooks in the correct order and render required endpoints tooltip', () => {
    const mockAlreadySelectedCookbooks = [
      mockAgenticCookbooks[0],
      mockAgenticCookbooks[2],
    ];
    (useAppSelector as jest.Mock).mockImplementation(
      () => mockAlreadySelectedCookbooks
    );
    renderWithProviders(
      <AgenticCookbooksSelection
        onCookbookSelected={mockOnCookbookSelected}
        onCookbookUnselected={mockOnCookbookUnselected}
        onCookbookAboutClick={mockOnCookbookAboutClick}
        onCookbookAboutClose={mockOnCookbookAboutClose}
      />
    );
    const cookbookItems = screen.getAllByRole('cookbookcard');
    expect(cookbookItems).toHaveLength(mockAgenticCookbooks.length);
    expect(cookbookItems[0]).toHaveTextContent(mockAgenticCookbooks[1].name);
    expect(cookbookItems[1]).toHaveTextContent(mockAgenticCookbooks[2].name);
    expect(cookbookItems[2]).toHaveTextContent(mockAgenticCookbooks[0].name);

    // Test agentic-specific tags (using getAllByText since tags appear multiple times)
    const uniqueTagNames = Array.from(
      new Set(mockAgenticCookbooks.flatMap((cookbook) => cookbook.tags ?? []))
    );
    for (const tag of uniqueTagNames) {
      expect(screen.getAllByText(tag).length).toBeGreaterThan(0);
    }

    // Test checkboxes
    expect(
      screen.getByRole('checkbox', {
        name: `Select ${mockAgenticCookbooks[0].id}`,
      })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', {
        name: `Select ${mockAgenticCookbooks[2].id}`,
      })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', {
        name: `Select ${mockAgenticCookbooks[1].id}`,
      })
    ).not.toBeChecked();

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      updateAgenticCookbooks([mockAgenticCookbooks[0], mockAgenticCookbooks[2]])
    );

    // Test required endpoints tooltip
    mockAgenticCookbooks.forEach((cookbook) => {
      if (cookbook.required_config?.endpoints?.length) {
        cookbook.required_config.endpoints.forEach((endpoint) => {
          expect(screen.getByText(endpoint)).toBeInTheDocument();
        });
      }
      if (cookbook.required_config?.configurations?.embeddings?.length) {
        cookbook.required_config.configurations.embeddings.forEach(
          (endpoint) => {
            expect(screen.getByText(endpoint)).toBeInTheDocument();
          }
        );
      }
    });
  });

  it('should select and deselect an agentic cookbook', async () => {
    const mockNoSelectedCookbooks: Cookbook[] = [];
    (useAppSelector as jest.Mock).mockImplementation(
      () => mockNoSelectedCookbooks
    );
    const { rerender } = renderWithProviders(
      <AgenticCookbooksSelection
        onCookbookSelected={mockOnCookbookSelected}
        onCookbookUnselected={mockOnCookbookUnselected}
        onCookbookAboutClick={mockOnCookbookAboutClick}
        onCookbookAboutClose={mockOnCookbookAboutClose}
      />,
      {
        initialCookbooks: mockAgenticCookbooks,
      }
    );

    const cookbookOneCheckbox = screen.getByRole('checkbox', {
      name: `Select ${mockAgenticCookbooks[0].id}`,
    });

    await userEvent.click(cookbookOneCheckbox);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      addAgenticCookbooks([mockAgenticCookbooks[0]])
    );
    expect(mockOnCookbookSelected).toHaveBeenCalledTimes(1);
    expect(cookbookOneCheckbox).toBeChecked();

    await act(async () => {
      (useAppSelector as jest.Mock).mockImplementation(
        () => [mockAgenticCookbooks[0]] // simulate 1 cookbook selected
      );
      rerender(
        <AgenticCookbooksSelection
          onCookbookSelected={mockOnCookbookSelected}
          onCookbookUnselected={mockOnCookbookUnselected}
          onCookbookAboutClick={mockOnCookbookAboutClick}
          onCookbookAboutClose={mockOnCookbookAboutClose}
        />
      );
    });
    await userEvent.click(cookbookOneCheckbox);
    expect(mockDispatch).toHaveBeenCalledWith(
      removeAgenticCookbooks([mockAgenticCookbooks[0]])
    );
    expect(mockOnCookbookUnselected).toHaveBeenCalledTimes(1);
    expect(cookbookOneCheckbox).not.toBeChecked();
  });

  it('should call about click handler', async () => {
    const mockNoSelectedCookbooks: Cookbook[] = [];
    (useAppSelector as jest.Mock).mockImplementation(
      () => mockNoSelectedCookbooks
    );
    (useGetAllRecipesQuery as jest.Mock).mockReturnValue({
      data: [],
      isFetching: false,
    });
    renderWithProviders(
      <AgenticCookbooksSelection
        onCookbookSelected={mockOnCookbookSelected}
        onCookbookUnselected={mockOnCookbookUnselected}
        onCookbookAboutClick={mockOnCookbookAboutClick}
        onCookbookAboutClose={mockOnCookbookAboutClose}
      />,
      {
        initialCookbooks: mockAgenticCookbooks,
      }
    );

    const aboutButtons = screen.getAllByText('About');
    await userEvent.click(aboutButtons[0]);
    expect(mockOnCookbookAboutClick).toHaveBeenCalledTimes(1);
  });

  it('should display agentic-specific description and tab', () => {
    const mockNoSelectedCookbooks: Cookbook[] = [];
    (useAppSelector as jest.Mock).mockImplementation(
      () => mockNoSelectedCookbooks
    );
    renderWithProviders(
      <AgenticCookbooksSelection
        onCookbookSelected={mockOnCookbookSelected}
        onCookbookUnselected={mockOnCookbookUnselected}
        onCookbookAboutClick={mockOnCookbookAboutClick}
        onCookbookAboutClose={mockOnCookbookAboutClose}
      />
    );

    expect(
      screen.getByText('Select the cookbooks you want to run')
    ).toBeInTheDocument();
    expect(screen.getByText('Agentic Cookbooks')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Agentic cookbooks contain AISI Joint Testing datasets designed specifically for evaluating AI models in autonomous, multi-step reasoning scenarios.'
      )
    ).toBeInTheDocument();
  });
});
