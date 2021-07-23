import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface INotification {
  message: string;
  variant?: 'error' | 'success' | 'warning';
  action?: {
    label: string;
    onPress: () => void;
  };
}
interface INotificationState {
  queue: INotification[];
}

export const initialState = { queue: [] } as INotificationState;
export default createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    hideSnackbar: (state: INotificationState) => {
      state.queue = state.queue.slice(1);
    },
    showSnackbar: (state: INotificationState, action: PayloadAction<INotification>) => {
      state.queue.push(action.payload);
    },
  },
});
