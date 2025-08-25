import { AgenticNewSessionViews } from './enums';

type Action = {
  type:
    | 'NEXT_BTN_CLICK'
    | 'PREV_BTN_CLICK'
    | 'CREATE_MODEL_CLICK'
    | 'EDIT_MODEL_CLICK'
    | 'CLOSE_MODEL_FORM'
    | 'COOKBOOK_SELECTION_CLICK'
    | 'MODEL_SELECTION_CLICK'
    | 'SHOW_SURFACE_OVERLAY'
    | 'HIDE_SURFACE_OVERLAY';
  cookbooksLength?: number;
  modelsLength?: number;
  modelToEdit?: LLMEndpoint;
  hasAdditionalRequirements?: boolean;
};

type FlowState = {
  steps: string[];
  stepIndex: number;
  view: AgenticNewSessionViews;
  hideNextBtn: boolean;
  hidePrevBtn: boolean;
  disableNextBtn: boolean;
  disablePrevBtn: boolean;
  modelToEdit: LLMEndpoint | undefined;
  showSurfaceOverlay?: boolean;
};

export const flowSteps = ['Connect Endpoint', 'Select Tests', 'Run'];

export const initialState: FlowState = {
  steps: flowSteps,
  stepIndex: 0,
  view: AgenticNewSessionViews.ENDPOINTS_SELECTION,
  hideNextBtn: false,
  hidePrevBtn: true,
  disableNextBtn: true,
  disablePrevBtn: true,
  modelToEdit: undefined,
  showSurfaceOverlay: false,
};

export function agenticNewSessionFlowReducer(
  state: FlowState,
  action: Action
): FlowState {
  switch (action.type) {
    case 'NEXT_BTN_CLICK':
      if (state.view === AgenticNewSessionViews.ENDPOINTS_SELECTION) {
        return {
          ...state,
          stepIndex: state.stepIndex + 1,
          view: AgenticNewSessionViews.COOKBOOKS_SELECTION,
          hideNextBtn: false,
          disableNextBtn: action.cookbooksLength === 0,
          hidePrevBtn: false,
          disablePrevBtn: false,
          showSurfaceOverlay: false,
        };
      }
      if (state.view === AgenticNewSessionViews.COOKBOOKS_SELECTION) {
        return {
          ...state,
          stepIndex: state.stepIndex + 1,
          view: AgenticNewSessionViews.AGENTIC_RUN_FORM,
          hidePrevBtn: false,
          hideNextBtn: true,
          disablePrevBtn: false,
          disableNextBtn: true,
          showSurfaceOverlay: false,
        };
      }
      break;
    case 'PREV_BTN_CLICK':
      if (state.view === AgenticNewSessionViews.AGENTIC_RUN_FORM) {
        return {
          ...state,
          stepIndex: state.stepIndex - 1,
          view: AgenticNewSessionViews.COOKBOOKS_SELECTION,
          hidePrevBtn: false,
          hideNextBtn: false,
          disableNextBtn: false,
          showSurfaceOverlay: false,
        };
      }
      if (state.view === AgenticNewSessionViews.COOKBOOKS_SELECTION) {
        return {
          ...state,
          stepIndex: state.stepIndex - 1,
          view: AgenticNewSessionViews.ENDPOINTS_SELECTION,
          hidePrevBtn: true,
          disablePrevBtn: true,
          hideNextBtn: false,
          disableNextBtn: false,
          showSurfaceOverlay: false,
        };
      }
      break;
    case 'COOKBOOK_SELECTION_CLICK':
      return {
        ...state,
        disableNextBtn: action.cookbooksLength === 0,
      };
    case 'MODEL_SELECTION_CLICK':
      return {
        ...state,
        disableNextBtn: action.modelsLength === 0,
      };
    case 'CREATE_MODEL_CLICK':
      return {
        ...state,
        view: AgenticNewSessionViews.NEW_ENDPOINT_FORM,
        hideNextBtn: true,
        hidePrevBtn: true,
        disableNextBtn: true,
        disablePrevBtn: true,
      };
    case 'EDIT_MODEL_CLICK':
      return {
        ...state,
        view: AgenticNewSessionViews.EDIT_ENDPOINT_FORM,
        modelToEdit: action.modelToEdit,
        hideNextBtn: true,
        hidePrevBtn: true,
        disableNextBtn: true,
        disablePrevBtn: true,
      };
    case 'CLOSE_MODEL_FORM':
      const targetView =
        state.stepIndex === 0
          ? AgenticNewSessionViews.ENDPOINTS_SELECTION
          : AgenticNewSessionViews.COOKBOOKS_SELECTION;
      return {
        ...state,
        view: targetView,
        modelToEdit: undefined,
        hideNextBtn: false,
        hidePrevBtn: state.stepIndex === 0 ? true : false,
        disableNextBtn: action.modelsLength === 0,
        disablePrevBtn: state.stepIndex === 0 ? true : false,
      };
    case 'SHOW_SURFACE_OVERLAY':
      return {
        ...state,
        showSurfaceOverlay: true,
      };
    case 'HIDE_SURFACE_OVERLAY':
      return {
        ...state,
        showSurfaceOverlay: false,
      };
    default:
      return state;
  }
  return state;
}
