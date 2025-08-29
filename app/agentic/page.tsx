'use client';
import TestingHomePage from '@/app/components/testingHomePage';
import { agenticConfig } from '@/app/config/testingConfigs';
import {
  resetAgenticCookbooks,
  resetAgenticModels,
  useAppDispatch,
} from '@/lib/redux';

export default function AgenticHomePage() {
  const dispatch = useAppDispatch();
  function handleStartNewRunClick() {
    dispatch(resetAgenticCookbooks());
    dispatch(resetAgenticModels());
  }

  return (
    <TestingHomePage
      title={agenticConfig.title}
      menuItems={agenticConfig.menuItems}
      onStartNewRunClick={handleStartNewRunClick}
    />
  );
}
