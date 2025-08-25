import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type AgenticModelsState = {
  entities: LLMEndpoint[];
};

const initialState: AgenticModelsState = {
  entities: [],
};

export const agenticModelsStateSlice = createSlice({
  name: 'agenticModels',
  initialState,
  reducers: {
    addAgenticModels: (state, action: PayloadAction<LLMEndpoint[]>) => {
      state.entities.unshift(...action.payload);
    },
    removeAgenticModels: (state, action: PayloadAction<LLMEndpoint[]>) => {
      state.entities = state.entities.filter(
        (entity) =>
          !action.payload.find(
            (payloadEntity) => payloadEntity.id === entity.id
          )
      );
    },
    resetAgenticModels: (state) => {
      state.entities = [];
    },
  },
});

export const { addAgenticModels, removeAgenticModels, resetAgenticModels } =
  agenticModelsStateSlice.actions;
