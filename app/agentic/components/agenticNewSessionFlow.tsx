'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { CookbookSelector } from '@/app/components/cookbookSelector/cookbookSelector';
import { agenticCookbookSelectorConfig } from '@/app/config/testingConfigs';
import { EndpointsSelector } from '@/app/components/endpointsSelector';
import { CookbooksProvider } from '@/app/benchmarking/contexts/cookbooksContext';
import { Icon, IconName } from '@/app/components/IconSVG';
import { Button, ButtonType } from '@/app/components/button';
import { MainSectionSurface } from '@/app/components/mainSectionSurface';
import { Modal } from '@/app/components/modal';
import SimpleStepsIndicator from '@/app/components/simpleStepsIndicator';
import { colors } from '@/app/customColors';
import { NewEndpointForm } from '@/app/endpoints/(edit)/newEndpointForm';
import {
  addAgenticModels,
  removeAgenticModels,
  resetAgenticCookbooks,
  resetAgenticModels,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';
import {
  agenticNewSessionFlowReducer,
  initialState,
} from './agenticNewSessionFlowReducer';
import AgenticRunForm from './agenticRunForm';
import { AgenticNewSessionViews } from './enums';

function AgenticNewSessionFlow() {
  const router = useRouter();
  const appDispatch = useAppDispatch();
  const [flowState, dispatch] = React.useReducer(
    agenticNewSessionFlowReducer,
    initialState
  );
  const selectedCookbooks = useAppSelector(
    (state) => state.agenticCookbooks.entities
  );
  const selectedModels = useAppSelector(
    (state) => state.agenticModels.entities
  );
  const [showExitModal, setShowExitModal] = React.useState(false);

  function handleNextIconClick() {
    dispatch({
      type: 'NEXT_BTN_CLICK',
      cookbooksLength: selectedCookbooks.length,
      modelsLength: selectedModels.length,
      hasAdditionalRequirements: false, // Agentic tests don't have additional requirements for now
    });
  }

  function handlePreviousIconClick() {
    dispatch({
      type: 'PREV_BTN_CLICK',
      cookbooksLength: selectedCookbooks.length,
      modelsLength: selectedModels.length,
    });
  }

  function handleOnCloseIconClick() {
    setShowExitModal(true);
  }

  function handleExitWorkflow() {
    appDispatch(resetAgenticCookbooks());
    appDispatch(resetAgenticModels());
    router.push('/agentic');
  }

  function handleModelClick(model: LLMEndpoint) {
    if (selectedModels.find((endpoint) => endpoint.id === model.id)) {
      appDispatch(removeAgenticModels([model]));
      dispatch({
        type: 'MODEL_SELECTION_CLICK',
        modelsLength: selectedModels.length - 1,
      });
    } else {
      appDispatch(addAgenticModels([model]));
      dispatch({
        type: 'MODEL_SELECTION_CLICK',
        modelsLength: selectedModels.length + 1,
      });
    }
  }

  function handleCookbookSelectedOrUnselected(selectedCookbooks: Cookbook[]) {
    dispatch({
      type: 'COOKBOOK_SELECTION_CLICK',
      cookbooksLength: selectedCookbooks.length,
      hasAdditionalRequirements: false, // Agentic tests don't have additional requirements for now
    });
  }

  function handleEditModelClick(model: LLMEndpoint) {
    dispatch({
      type: 'EDIT_MODEL_CLICK',
      modelToEdit: model,
    });
  }

  function handleCreateModelClick() {
    dispatch({
      type: 'CREATE_MODEL_CLICK',
    });
  }

  let surfaceColor = colors.moongray['950'];
  let view: React.ReactElement | undefined;

  switch (flowState.view) {
    case AgenticNewSessionViews.ENDPOINTS_SELECTION:
      view = (
        <EndpointsSelector
          selectedModels={selectedModels}
          totalSelected={selectedModels.length}
          onModelClick={handleModelClick}
          onEditClick={handleEditModelClick}
          onCreateClick={handleCreateModelClick}
        />
      );
      break;
    case AgenticNewSessionViews.NEW_ENDPOINT_FORM:
      view = (
        <NewEndpointForm
          onClose={() =>
            dispatch({
              type: 'CLOSE_MODEL_FORM',
              modelsLength: selectedModels.length,
            })
          }
        />
      );
      break;
    case AgenticNewSessionViews.EDIT_ENDPOINT_FORM:
      view = (
        <NewEndpointForm
          endpointToEdit={flowState.modelToEdit}
          onClose={() => dispatch({ type: 'CLOSE_MODEL_FORM' })}
        />
      );
      break;
    case AgenticNewSessionViews.COOKBOOKS_SELECTION:
      view = (
        <CookbookSelector
          {...agenticCookbookSelectorConfig}
          onCookbookAboutClose={() =>
            dispatch({
              type: 'HIDE_SURFACE_OVERLAY',
            })
          }
          onCookbookAboutClick={() =>
            dispatch({
              type: 'SHOW_SURFACE_OVERLAY',
            })
          }
          onCookbookSelected={handleCookbookSelectedOrUnselected}
          onCookbookUnselected={handleCookbookSelectedOrUnselected}
        />
      );
      break;
    case AgenticNewSessionViews.AGENTIC_RUN_FORM:
      surfaceColor = colors.moongray['950'];
      view = (
        <AgenticRunForm
          selectedCookbooks={selectedCookbooks}
          selectedEndpoints={selectedModels}
        />
      );
      break;
  }

  return (
    <React.Fragment>
      <CookbooksProvider>
        {showExitModal && (
          <Modal
            heading="Exit this workflow?"
            bgColor={colors.moongray['800']}
            textColor="#FFFFFF"
            primaryBtnLabel="Exit Workflow"
            secondaryBtnLabel="Cancel"
            enableScreenOverlay
            onCloseIconClick={() => setShowExitModal(false)}
            onPrimaryBtnClick={handleExitWorkflow}
            onSecondaryBtnClick={() => setShowExitModal(false)}>
            <p className="text-[0.9rem] pt-3">
              If you exit this workflow now, your progress will not be saved.{' '}
              <br />
              You should complete this workflow before exiting.
            </p>
          </Modal>
        )}
        <MainSectionSurface
          onCloseIconClick={handleOnCloseIconClick}
          height="100%"
          bgColor={surfaceColor}
          headerHeight={80}
          bodyHeight="calc(100% - 80px)"
          showHeaderDivider
          bodyClassName="!p-0"
          showSurfaceOverlay={flowState.showSurfaceOverlay}
          headerContent={
            <SimpleStepsIndicator
              textColor={colors.moongray[300]}
              stepColor={colors.moonpurplelight}
              steps={flowState.steps}
              currentStepIndex={flowState.stepIndex}
              className="!w-[80%]"
            />
          }>
          <div className="flex flex-col items-center h-full">
            <div
              className="flex flex-col gap-5 ipad11Inch:gap-2 ipadPro:gap-2 justify-center w-full"
              style={{ height: 'calc(100% - 60px)' }}>
              {view}
            </div>
            <div
              className={`flex 
              ${!flowState.hidePrevBtn && !flowState.hideNextBtn ? 'justify-between' : ''} 
              ${flowState.hidePrevBtn && !flowState.hideNextBtn ? 'justify-end' : ''} 
              ${!flowState.hidePrevBtn && flowState.hideNextBtn ? 'justify-start' : ''} 
              items-center w-full h-[60px] px-4
           bg-moongray-950 shadow-[0_-2px_5px_-2px_rgba(0,0,0,0.3)] rounded-b-2xl`}>
              {!flowState.hidePrevBtn ? (
                <Button
                  ariaLabel="Previous View"
                  mode={ButtonType.TEXT}
                  text="BACK"
                  textSize="1.3rem"
                  textColor={colors.moonpurplelight}
                  leftIconName={IconName.ThinArrowLeft}
                  iconSize={24}
                  iconColor={colors.moonpurplelight}
                  disabled={flowState.disablePrevBtn}
                  onClick={handlePreviousIconClick}
                />
              ) : null}
              {!flowState.hideNextBtn ? (
                <Button
                  ariaLabel="Next View"
                  mode={ButtonType.TEXT}
                  text="NEXT"
                  textSize="1.3rem"
                  textColor={colors.moonpurplelight}
                  rightIconName={IconName.ThinArrowRight}
                  iconSize={24}
                  iconColor={colors.moonpurplelight}
                  disabled={flowState.disableNextBtn}
                  onClick={
                    flowState.disableNextBtn ? undefined : handleNextIconClick
                  }
                />
              ) : null}
            </div>
          </div>
        </MainSectionSurface>
      </CookbooksProvider>
    </React.Fragment>
  );
}

export { AgenticNewSessionFlow };
