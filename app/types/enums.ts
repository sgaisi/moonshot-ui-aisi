export enum AppEventTypes {
  SYSTEM_UPDATE = 'system-update',
  BENCHMARK_UPDATE = 'benchmark-update',
  BENCHMARK_COMPLETE = 'benchmark-complete',
  REDTEAM_UPDATE = 'redteam-update',
  AGENTIC_UPDATE = 'agentic-update',
  AGENTIC_COMPLETE = 'agentic-complete',
}

export enum BenchmarkCollectionType {
  COOKBOOK = 'cookbook',
  BENCHMARK = 'benchmark',
}

export enum AgenticCollectionType {
  COOKBOOK = 'cookbook',
  RECIPE = 'recipe',
}

export enum TestStatusProgress {
  COMPLETED = 'completed',
  RUNNING = 'running',
  ERRORS = 'completed_with_errors',
  CANCELLED = 'cancelled',
}

export enum RedteamStatusProgress {
  COMPLETED = 'completed',
  RUNNING = 'running',
  ERRORS = 'completed_with_errors',
  CANCELLED = 'cancelled',
}
