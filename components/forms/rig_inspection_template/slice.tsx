import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RigInspection, FormTemplate } from "../../../graphql/schema";


export interface FieldItem {
  label: string;
  description?: string;
  isRequired?: boolean;
  valueType: "integer" | "boolean" | "date" | "string";
  value?: number | boolean | string;
}

interface IRigInspectionEditState {
  original: FormTemplate | null;
  fields: FieldItem[],
}

const initialState: IRigInspectionEditState = {
  original: null,
  fields: []
};


export default createSlice({
  name: 'rigInspectionTemplateForm',
  initialState,
  reducers: {
    setFields: (state: IRigInspectionEditState, action: PayloadAction<FieldItem[]>) => {
      state.fields = action.payload;
    },

    setOriginal: (state: IRigInspectionEditState, action: PayloadAction<FormTemplate>) => {
      state.original = action.payload;

      try {
        state.fields = JSON.parse(action.payload.definition!);
      } catch(err) {
        console.log("Invalid json: ", action.payload.definition);
      }
    },
    
    reset: (state: IRigInspectionEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});

