// notificationsSlice.tsx
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { notificationsApi } from '../../apis/microserviceApi';

interface Notification {
  id: string;
  userId: string;
  type: 'book_recommendation' | 'new_review' | 'system_update';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: {
    notifications: boolean;
    unreadCount: boolean;
    markingAsRead: boolean;
  };
  error: {
    notifications: string | null;
    unreadCount: string | null;
    markingAsRead: string | null;
  };
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: {
    notifications: false,
    unreadCount: false,
    markingAsRead: false,
  },
  error: {
    notifications: null,
    unreadCount: null,
    markingAsRead: null,
  },
};

// Async thunks
export const fetchUserNotifications = createAsyncThunk(
  'notifications/fetchUserNotifications',
  async ({ userId, token }: { userId: string; token?: string }) => {
    const response = await notificationsApi.getUserNotifications(userId, token);
    // Extract notifications from the nested response structure
    return response?.data?.notifications || response || [];
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async ({ userId, token }: { userId: string; token?: string }) => {
    const response = await notificationsApi.getUnreadCount(userId, token);
    // Extract count from the nested response structure
    return response?.count !== undefined ? { count: response.count } : response || { count: 0 };
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async ({ notificationId, token }: { notificationId: string; token?: string }) => {
    const response = await notificationsApi.markAsRead(notificationId, token);
    return { notificationId, response };
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = {
        notifications: null,
        unreadCount: null,
        markingAsRead: null,
      };
    },
    clearErrors: (state) => {
      state.error = {
        notifications: null,
        unreadCount: null,
        markingAsRead: null,
      };
    },
    markAllAsRead: (state) => {
      state.notifications = state.notifications.map(notification => ({
        ...notification,
        isRead: true,
      }));
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading.notifications = true;
        state.error.notifications = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.loading.notifications = false;
        state.notifications = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading.notifications = false;
        state.error.notifications = action.error.message || 'Failed to fetch notifications';
        state.notifications = []; // Ensure it's always an array
      })
      // Fetch Unread Count
      .addCase(fetchUnreadCount.pending, (state) => {
        state.loading.unreadCount = true;
        state.error.unreadCount = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action: PayloadAction<{ count: number }>) => {
        state.loading.unreadCount = false;
        state.unreadCount = action.payload.count;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.loading.unreadCount = false;
        state.error.unreadCount = action.error.message || 'Failed to fetch unread count';
      })
      // Mark as Read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading.markingAsRead = true;
        state.error.markingAsRead = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading.markingAsRead = false;
        const notificationId = action.payload.notificationId;
        const notificationIndex = state.notifications.findIndex(n => n.id === notificationId);
        if (notificationIndex !== -1) {
          state.notifications[notificationIndex].isRead = true;
          if (state.unreadCount > 0) {
            state.unreadCount -= 1;
          }
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading.markingAsRead = false;
        state.error.markingAsRead = action.error.message || 'Failed to mark notification as read';
      });
  },
});

export const { clearNotifications, clearErrors, markAllAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;