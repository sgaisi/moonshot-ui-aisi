import { useState } from 'react';
import { CookbooksAgenticResult } from '@/app/agentic/report/types/agenticReportTypes';
import { Button, ButtonType } from '@/app/components/button';
import { SelectInput } from '@/app/components/selectInput';
import { colors } from '@/app/customColors';

type AgenticHeaderControlsProps = {
  agenticResult: CookbooksAgenticResult;
  onEndpointChange: (endpointId: string) => void;
  onBtnClick: () => void;
  disabled: boolean;
};

export function AgenticHeaderControls(props: AgenticHeaderControlsProps) {
  const { agenticResult, onEndpointChange, onBtnClick, disabled } = props;
  const [selectedEndpointId, setSelectedEndpointId] = useState(
    agenticResult.metadata.endpoints[0]
  );
  const endpointOptions = agenticResult.metadata.endpoints.map((endpoint) => ({
    label: endpoint,
    value: endpoint,
  }));

  function handleEndpointChange(endpointId: string) {
    setSelectedEndpointId(endpointId);
    onEndpointChange(endpointId);
  }

  return (
    <section className="flex w-full items-center mt-6">
      <div className="flex-1 flex gap-4 items-center">
        <h3 className="text-white text-[1rem]">Showing agentic results for</h3>
        <SelectInput
          name="endpoint"
          options={endpointOptions}
          value={selectedEndpointId}
          onChange={handleEndpointChange}
          style={{ marginBottom: 0, width: 400 }}
          disabled={disabled}
        />
      </div>

      <Button
        mode={ButtonType.OUTLINE}
        text={disabled ? 'Downloading...' : 'Download Agentic Report'}
        onClick={onBtnClick}
        hoverBtnColor={colors.moongray[800]}
        disabled={disabled}
      />
    </section>
  );
}
