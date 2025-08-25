import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type AgenticCookbooksState = {
  entities: Cookbook[];
};

const initialState: AgenticCookbooksState = {
  entities: [],
};

export const agenticCookbooksStateSlice = createSlice({
  name: 'agenticCookbooks',
  initialState,
  reducers: {
    addAgenticCookbooks: (state, action: PayloadAction<Cookbook[]>) => {
      state.entities.unshift(...action.payload);
    },
    removeAgenticCookbooks: (state, action: PayloadAction<Cookbook[]>) => {
      state.entities = state.entities.filter(
        (entity) =>
          !action.payload.find(
            (payloadEntity) => payloadEntity.id === entity.id
          )
      );
    },
    updateAgenticCookbooks: (state, action: PayloadAction<Cookbook[]>) => {
      action.payload.forEach((payloadCookbook) => {
        const index = state.entities.findIndex(
          (stateCookbook) => stateCookbook.id === payloadCookbook.id
        );
        if (index !== -1) {
          state.entities[index] = payloadCookbook;
        }
      });
    },
    resetAgenticCookbooks: (state) => {
      state.entities = [];
    },
  },
});

export const {
  addAgenticCookbooks,
  removeAgenticCookbooks,
  resetAgenticCookbooks,
  updateAgenticCookbooks,
} = agenticCookbooksStateSlice.actions;
