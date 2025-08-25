import React from 'react';
import { useFormState } from 'react-dom';
import { Icon, IconName } from '@/app/components/IconSVG';
import { FormStateErrorList } from '@/app/components/formStateErrorList';
import { Modal } from '@/app/components/modal';
import { Slider } from '@/app/components/slider/Slider';
import { TextArea } from '@/app/components/textArea';
import { TextInput } from '@/app/components/textInput';
import ToggleSwitch from '@/app/components/toggleSwitch';
import { Tooltip, TooltipPosition } from '@/app/components/tooltip';
import { colors } from '@/app/customColors';
import { createAgenticRun } from '@/actions/createAgenticRun';
import { RunButton } from '@/app/benchmarking/components/runButton';

const MemoizedToggleSwitch = React.memo(ToggleSwitch);

const initialFormValues: FormState<AgenticRunFormValues> = {
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

type AgenticRunFormProps = {
  selectedCookbooks: Cookbook[];
  selectedEndpoints: LLMEndpoint[];
};

function AgenticRunForm({
  selectedCookbooks,
  selectedEndpoints,
}: AgenticRunFormProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [percentageOfPrompts, setPercentageOfPrompts] = React.useState(100);
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [isRunAll, setIsRunAll] = React.useState(true);
  const [formState, formAction] = useFormState<
    FormState<AgenticRunFormValues>,
    FormData
  >(createAgenticRun, initialFormValues);

  const prevPercentageValue = React.useRef(percentageOfPrompts);

  React.useEffect(() => {
    if (formState.formStatus === 'error') {
      setShowErrorModal(true);
      return;
    }
  }, [formState]);

  function handleSliderMouseUp(value: number) {
    if (value === 100) return;
    prevPercentageValue.current = value;
  }

  const handleSliderValueChange = (value: number) => {
    setPercentageOfPrompts(value);
    if (value === 100) {
      setIsRunAll(true);
    } else {
      setIsRunAll(false);
    }
  };

  const handleRunAllChange = React.useCallback((isChecked: boolean) => {
    const prevValue =
      prevPercentageValue.current !== 100 ? prevPercentageValue.current : 1;
    setPercentageOfPrompts(isChecked ? 100 : prevValue);
    setIsRunAll(isChecked);
  }, []);

  const disableRunBtn = !name;

  return (
    <>
      {showErrorModal && (
        <Modal
          heading={
            <div className="flex items-center justify-center gap-2">
              <Icon
                name={IconName.Alert}
                size={30}
                color="red"
              />
              <div className="text-lg">Errors</div>
            </div>
          }
          bgColor={colors.moongray['800']}
          textColor="#FFFFFF"
          primaryBtnLabel="Close"
          enableScreenOverlay
          onCloseIconClick={() => setShowErrorModal(false)}
          onPrimaryBtnClick={() => setShowErrorModal(false)}>
          <div className="flex flex-col gap-2 items-start">
            {formState.formErrors && (
              <FormStateErrorList formErrors={formState.formErrors} />
            )}
          </div>
        </Modal>
      )}
      <section className="flex flex-col items-center justify-center min-h-[300px] gap-5">
        <div className="flex flex-col w-[55%] ipad11Inch:w-[60%] ipadPro:w-[65%] gap-2">
          <form
            action={formAction}
            className="ipad11Inch:h-[calc(300px)] ipadPro:h-[calc(300px)] overflow-y-auto custom-scrollbar ipad11Inch:p-6 ipadPro:p-6 px-6">
            {selectedCookbooks.map((cookbook) => (
              <input
                readOnly
                key={cookbook.id}
                type="hidden"
                name="inputs"
                defaultValue={cookbook.id}
              />
            ))}
            {selectedEndpoints.map((endpoint) => (
              <input
                readOnly
                key={endpoint.id}
                type="hidden"
                name="endpoints"
                defaultValue={endpoint.id}
              />
            ))}
            <input
              readOnly
              type="number"
              name="random_seed"
              defaultValue={initialFormValues.random_seed}
              style={{ display: 'none' }}
            />
            <input
              readOnly
              type="hidden"
              name="runner_processing_module"
              defaultValue={initialFormValues.runner_processing_module}
            />
            <input
              readOnly
              type="hidden"
              name="system_prompt"
              defaultValue={initialFormValues.system_prompt}
            />
            <TextInput
              id="run_name"
              name="run_name"
              label="Name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              error={formState.formErrors?.run_name?.[0]}
              labelStyles={{
                fontSize: '1rem',
                color: colors.moonpurplelight,
              }}
              inputStyles={{ height: 38 }}
              placeholder="Give this agentic session a unique name"
            />

            <TextArea
              id="description"
              name="description"
              label="Description (optional)"
              labelStyles={{
                fontSize: '1rem',
                color: colors.moonpurplelight,
              }}
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              error={formState.formErrors?.description?.[0]}
              placeholder="Description of this agentic run"
            />

            <div className="relative flex flex-col">
              <div className="w-full flex flex-col">
                <div className="absolute top-[2px] left-[140px]">
                  <Tooltip
                    position={TooltipPosition.right}
                    offsetLeft={10}
                    content={
                      <div>
                        <p>
                          Before running the full set of prompts, you may want
                          to run a smaller set as a sanity check.
                        </p>
                      </div>
                    }>
                    <Icon
                      name={IconName.Alert}
                      color={colors.moonpurplelight}
                    />
                  </Tooltip>
                </div>
                <Slider.Label className="!text-moonpurplelight">
                  Run a smaller set
                </Slider.Label>
                <p className="text-moongray-400">
                  Select the percentage of prompts you want to run from the
                  cookbook(s) selected.
                </p>
                <Slider
                  min={1}
                  max={100}
                  initialValue={isRunAll ? 100 : percentageOfPrompts}
                  className="mt-[45px] mb-[10px]"
                  valueSuffix="%"
                  onChange={handleSliderValueChange}
                  onMouseUp={handleSliderMouseUp}>
                  <Slider.Track />
                  <Slider.ProgressTrack />
                  <Slider.Handle>
                    <div className="absolute left-[50%] top-[-220%] transform -translate-x-1/2">
                      <Slider.Value />
                    </div>
                  </Slider.Handle>
                  <Slider.Input
                    name="prompt_selection_percentage"
                    style={{ display: 'none' }}
                  />
                </Slider>
                <p className="text-white text-[0.9rem] mb-[10px]">
                  Prompts will be run at {percentageOfPrompts}% selection
                </p>
              </div>
              <div className="flex justify-left gap-2 mb-8">
                <p className="text-moonpurplelight">
                  Run All{' '}
                  <span
                    className={`${isRunAll ? 'text-white' : 'text-moongray-400'}`}>
                    (100% of prompts)
                  </span>
                </p>
                <MemoizedToggleSwitch
                  name="run_all"
                  onChange={handleRunAllChange}
                  value={isRunAll ? 'true' : undefined}
                  defaultChecked={percentageOfPrompts === 100}
                />
              </div>
            </div>

            <div className="bg-moongray-900 p-4 rounded-lg mb-4">
              <h4 className="text-moonpurplelight mb-2">
                Agentic Configuration
              </h4>
              <p className="text-moongray-400 text-sm mb-3">
                Agentic tests will be run with default parameters optimized for
                autonomous AI behavior testing.
              </p>
              <div className="text-white text-sm">
                <p>
                  <strong>Processing Module:</strong> agentic
                </p>
                <p>
                  <strong>Run Iteration:</strong> 1
                </p>
                <p>
                  <strong>Selected Cookbooks:</strong>{' '}
                  {selectedCookbooks.length}
                </p>
                <p>
                  <strong>Selected Endpoints:</strong>{' '}
                  {selectedEndpoints.length}
                </p>
              </div>
            </div>

            <RunButton
              disabled={disableRunBtn}
              className="absolute bottom-[8px] right-[18px]"
            />
          </form>
        </div>
      </section>
    </>
  );
}

export default AgenticRunForm;
