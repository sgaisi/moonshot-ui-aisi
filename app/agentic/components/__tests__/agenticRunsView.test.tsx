import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import { RunsView } from '@/app/components/runsView';
import { agenticRunsViewConfig } from '@/app/config/testingConfigs';

jest.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({
      children,
      href,
      onClick,
      onMouseEnter,
      onMouseLeave,
    }: {
      children: React.ReactNode;
      href: string;
      onClick: React.MouseEventHandler<HTMLAnchorElement>;
      onMouseEnter: React.MouseEventHandler<HTMLAnchorElement>;
      onMouseLeave: React.MouseEventHandler<HTMLAnchorElement>;
    }) => {
      return (
        <a
          href={href}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}>
          {children}
        </a>
      );
    },
  };
});

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

const mockGetParam: jest.Mock = jest.fn();

const mockAgenticRunners: Runner[] = [
  {
    id: 'agentic-1',
    name: 'Agentic Runner 1',
    endpoints: ['agentic-endpoint1', 'agentic-endpoint2'],
    description: 'Description for Agentic Runner 1',
    runner_args: {
      cookbooks: ['agentic-cookbook1', 'agentic-cookbook2'],
      prompt_selection_percentage: 100,
      random_seed: 1,
      system_prompt: '',
      runner_processing_module: 'agentic',
      result_processing_module: 'agentic-result',
    },
    start_time: 1620000000,
  },
  {
    id: 'agentic-2',
    name: 'Agentic Runner 2',
    endpoints: ['agentic-endpoint3', 'agentic-endpoint4'],
    description: 'Description for Agentic Runner 2',
    runner_args: {
      cookbooks: ['agentic-cookbook3', 'agentic-cookbook4'],
      prompt_selection_percentage: 50,
      random_seed: 1,
      system_prompt: '',
      runner_processing_module: 'agentic',
      result_processing_module: 'agentic-result',
    },
    start_time: 1620003600,
  },
];

const mockAgenticResultIds: string[] = ['agentic-1', 'agentic-2'];

it('renders AgenticRunsView', async () => {
  (useSearchParams as jest.Mock).mockImplementation(() => ({
    get: mockGetParam,
  }));
  mockGetParam.mockReturnValue(undefined);
  render(
    <RunsView
      {...agenticRunsViewConfig}
      runners={mockAgenticRunners}
      resultIds={mockAgenticResultIds}
    />
  );

  const viewResultsLink = screen.getByRole('link', { name: /view results/i });
  expect(viewResultsLink).toBeInTheDocument();
  expect(viewResultsLink.getAttribute('href')).toBe(
    `/agentic/report?id=${mockAgenticRunners[0].id}`
  );
  expect(screen.queryAllByText(mockAgenticRunners[0].name)).toHaveLength(2);
  expect(screen.queryAllByText(mockAgenticRunners[1].name)).toHaveLength(1);

  await userEvent.click(screen.getByText(mockAgenticRunners[1].name));
  expect(screen.queryAllByText(mockAgenticRunners[0].name)).toHaveLength(1);
  expect(screen.queryAllByText(mockAgenticRunners[1].name)).toHaveLength(2);
  expect(viewResultsLink.getAttribute('href')).toBe(
    `/agentic/report?id=${mockAgenticRunners[1].id}`
  );
});

it('displays agentic-specific runner information', () => {
  (useSearchParams as jest.Mock).mockImplementation(() => ({
    get: mockGetParam,
  }));
  mockGetParam.mockReturnValue(undefined);
  render(
    <RunsView
      {...agenticRunsViewConfig}
      runners={mockAgenticRunners}
      resultIds={mockAgenticResultIds}
    />
  );

  // Test that agentic runners are displayed (using getAllByText since names and descriptions appear multiple times)
  expect(
    screen.getAllByText(mockAgenticRunners[0].name).length
  ).toBeGreaterThan(0);
  expect(
    screen.getAllByText(mockAgenticRunners[1].name).length
  ).toBeGreaterThan(0);
  expect(
    screen.getAllByText(mockAgenticRunners[0].description).length
  ).toBeGreaterThan(0);
  expect(
    screen.getAllByText(mockAgenticRunners[1].description).length
  ).toBeGreaterThan(0);
});
