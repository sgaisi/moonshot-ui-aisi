import React from 'react';
import { RunForm } from '@/app/components/runForm';
import { agenticRunFormConfig } from '@/app/config/testingConfigs';

type AgenticRunFormProps = {
  selectedCookbooks: Cookbook[];
  selectedEndpoints: LLMEndpoint[];
};

function AgenticRunForm({
  selectedCookbooks,
  selectedEndpoints,
}: AgenticRunFormProps) {
  return (
    <RunForm
      {...agenticRunFormConfig}
      selectedCookbooks={selectedCookbooks}
      selectedEndpoints={selectedEndpoints}
    />
  );
}

export default AgenticRunForm;
