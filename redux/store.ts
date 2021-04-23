import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import MMKV from "react-native-mmkv-storage";
import { persistStore, persistCombineReducers } from "redux-persist";
import storage from 'redux-persist/lib/storage';

import globalSlice from "./global";
import { Platform } from "react-native";
import notificationSlice from "../components/notifications/slice";

import loginSlice from "../screens/unauthenticated/login/slice";
import signUpSlice from "../screens/unauthenticated/signup/slice";
import usersSlice from "../screens/authenticated/users/slice";
import dropzoneFormSlice from "../components/forms/dropzone/slice";
import planeFormSlice from "../components/forms/plane/slice";
import ticketTypeFormSlice from "../components/forms/ticket_type/slice";
import extraFormSlice from "../components/forms/extra/slice";
import loadFormSlice from "../components/forms/load/slice";
import slotFormSlice from "../components/forms/slot/slice";
import userFormSlice from "../components/forms/user/slice";
import dropzoneUserFormSlice from "../components/forms/dropzone_user/slice";
import rigFormSlice from "../components/forms/rig/slice";

// Re-export actions:
export const { actions: loginActions } = loginSlice;
export const { actions: signUpActions } = signUpSlice;
export const { actions: globalActions } = globalSlice;
export const { actions: usersActions } = usersSlice;
export const { actions: snackbarActions } = notificationSlice;
export const { actions: planeForm } = planeFormSlice;
export const { actions: dropzoneForm } = dropzoneFormSlice;
export const { actions: ticketTypeForm } = ticketTypeFormSlice;
export const { actions: extraForm } = extraFormSlice;
export const { actions: loadForm } = loadFormSlice;
export const { actions: slotForm } = slotFormSlice;
export const { actions: userForm } = userFormSlice;
export const { actions: dropzoneUserForm } = dropzoneUserFormSlice;
export const { actions: rigForm } = rigFormSlice;

const persistConfig = {
  key: 'root',
  storage: Platform.OS === "web" ? storage : MMKV(),
  whitelist: ["global", "notifications"],
};

console.log({ localStorage, MMKV });

const reducer = persistCombineReducers(persistConfig, {
    global: globalSlice.reducer,
    notifications: notificationSlice.reducer,
    login: loginSlice.reducer,
    signup: signUpSlice.reducer,
    dropzoneForm: dropzoneFormSlice.reducer,
    planeForm: planeFormSlice.reducer,
    ticketTypeForm: ticketTypeFormSlice.reducer,
    extraForm: extraFormSlice.reducer,
    loadForm: loadFormSlice.reducer,
    slotForm: slotFormSlice.reducer,
    userForm: userFormSlice.reducer,
    dropzoneUserForm: dropzoneUserFormSlice.reducer,
    rigForm: rigFormSlice.reducer,
    usersScreen: usersSlice.reducer,
  });

export const store = configureStore({
  reducer
});
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

