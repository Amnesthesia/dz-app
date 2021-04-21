import { Credential, User, Dropzone } from "../graphql/schema";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
} from 'react-native-paper';

const CombinedDefaultTheme = {
  ...PaperDefaultTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    ...NavigationDefaultTheme.colors,
  },
};
const CombinedDarkTheme = {
  ...PaperDarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    ...NavigationDarkTheme.colors,
  },
};

interface IGlobalState {
  currentUser: User | null;
  credentials: Credential | null;
  currentDropzone: Dropzone | null;
  permissions: string[];

  theme: typeof CombinedDarkTheme | typeof CombinedDefaultTheme,
  isDarkMode: boolean;
}

const initialState: IGlobalState = {
  currentUser: null,
  currentDropzone: null,
  permissions: [],
  credentials: null,
  theme: CombinedDefaultTheme,
  isDarkMode: false,
};
export default createSlice({
  name: 'global',
  initialState,
  reducers: {
    setCredentials: (state: IGlobalState, action: PayloadAction<Credential>) => {
      state.credentials = action.payload;
    },
    setUser: (state: IGlobalState, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    setPermissions: (state: IGlobalState, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
    setPrimaryColor: (state: IGlobalState, action: PayloadAction<string>) => {
      state.theme.colors.primary = action.payload;
    },
    setAccentColor: (state: IGlobalState, action: PayloadAction<string>) => {
      state.theme.colors.accent = action.payload;
    },
    setDropzone: (state: IGlobalState, action: PayloadAction<Dropzone>) => {
      state.currentDropzone = action.payload;

      if (state.currentDropzone?.primaryColor) {
        state.theme.colors.primary = state.currentDropzone?.primaryColor;
      }

      if (state.currentDropzone?.secondaryColor) {
        state.theme.colors.accent = state.currentDropzone?.secondaryColor;
      }
    },
    toggleDarkMode: (state: IGlobalState) => {
      state.isDarkMode = !state.isDarkMode;
      state.theme = state.isDarkMode ? CombinedDarkTheme : CombinedDefaultTheme;
      
      if (state.currentDropzone?.primaryColor) {
        state.theme.colors.primary = state.currentDropzone?.primaryColor;
      }

      if (state.currentDropzone?.secondaryColor) {
        state.theme.colors.accent = state.currentDropzone?.secondaryColor;
      }
    },
    logout: (state: IGlobalState) => {
      for(const key in initialState) {
        const typedKey = key as keyof IGlobalState;
        if (key in state) {
          (state[typedKey] as any) = initialState[typedKey];
        }
      }
    }
  }
});



