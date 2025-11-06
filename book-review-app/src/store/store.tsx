import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import recommendationsReducer from "../features/recommendations/recommendationsSlice";
import analyticsReducer from "../features/analytics/analyticsSlice";
import searchReducer from "../features/search/searchSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";

// store is not persistance. Which is causing issue on page refresh.
// TODO: Fix the store issue if time permits.

const store = configureStore({
  reducer: {
    auth: authReducer,
    recommendations: recommendationsReducer,
    analytics: analyticsReducer,
    search: searchReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
