'use client';
import TestingHomePage from '@/app/components/testingHomePage';
import { benchmarkingConfig } from '@/app/config/testingConfigs';
import {
  resetBenchmarkCookbooks,
  resetBenchmarkModels,
  useAppDispatch,
} from '@/lib/redux';

export default function BenchmarkingHomePage() {
  const dispatch = useAppDispatch();
  function handleStartNewRunClick() {
    dispatch(resetBenchmarkCookbooks());
    dispatch(resetBenchmarkModels());
  }

  return (
    <TestingHomePage
      title={benchmarkingConfig.title}
      menuItems={benchmarkingConfig.menuItems}
      onStartNewRunClick={handleStartNewRunClick}
    />
  );
}
