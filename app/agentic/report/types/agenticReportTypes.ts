import { GradingLevelsMlcEnum } from '@/app/benchmarking/report/components/mlcReportComponents/enums';

type CookbooksAgenticResult = {
  metadata: {
    id: string;
    start_time: string;
    end_time: string;
    duration: number;
    status: string;
    recipes: null | string[];
    cookbooks: string[];
    endpoints: string[];
    prompt_selection_percentage: number;
    random_seed: number;
    system_prompt: string;
    runner_processing_module: string;
    result_processing_module: string;
  };
  results: {
    cookbooks: AgenticCookbookResult[];
  };
};

type AgenticCookbookResult = {
  id: string;
  recipes: AgenticRecipeEvaluationResult[];
  overall_evaluation_summary: AgenticOverallEvaluationSummary[];
  total_num_of_prompts: number;
  agentic_capabilities: string[];
};

type AgenticRecipeEvaluationResult = {
  id: string;
  details: AgenticRecipeResultPromptData[];
  evaluation_summary: AgenticEvaluationSummary[];
  grading_scale: GradingScale;
  total_num_of_prompts: number;
  agentic_capabilities: string[];
};

type AgenticRecipeResultPromptData = {
  model_id: string;
  dataset_id: string;
  prompt_template_id: string;
  data: AgenticRecipePromptData[];
  metrics: AgenticMetric[];
};

type AgenticRecipePromptData = {
  prompt: string;
  predicted_result: string;
  target: string;
  duration: number;
};

type AgenticMetrics = {
  tool_usage_success_rate?: number;
  reasoning_quality?: number;
  task_completion_rate?: number;
  capabilities_tested?: string[];
  avg_tool_usage_success_rate?: number;
  avg_reasoning_quality?: number;
  avg_task_completion_rate?: number;
};

type AgenticGradingCriteria = {
  accuracy?: number;
  attack_success_rate?: number;
  toxicity_rate?: number;
  refusal_rate?: number;
  tool_usage_success_rate?: number;
  reasoning_quality?: number;
  task_completion_rate?: number;
};

type AgenticMetric = {
  grading_criteria: AgenticGradingCriteria;
  tool_usage_success_rate?: number;
  reasoning_quality?: number;
  task_completion_rate?: number;
  capabilities_tested?: string[];
} & {
  [key: string]:
    | number
    | string
    | string[]
    | AgenticGradingCriteria
    | undefined;
};

type AgenticEvaluationSummary = {
  model_id: string;
  num_of_prompts: number;
  avg_grade_value: number;
  grade: GradingLevelsMlcEnum | string | null;
  agentic_metrics: AgenticMetrics;
};

type AgenticOverallEvaluationSummary = {
  model_id: string;
  overall_grade: GradingLevelsMlcEnum | string;
};

type GradingScale = Record<string, number[]>;

type GradingColors = Record<GradingLevelsMlcEnum | string, string>;

type AgenticCookbookCategoryLabels = Record<string, 'A'[]>; // A for Agentic

export type {
  CookbooksAgenticResult,
  AgenticCookbookResult,
  AgenticRecipeEvaluationResult,
  AgenticRecipeResultPromptData,
  AgenticRecipePromptData,
  AgenticMetric,
  AgenticMetrics,
  AgenticEvaluationSummary,
  AgenticOverallEvaluationSummary,
  GradingScale,
  GradingColors,
  AgenticCookbookCategoryLabels,
};
