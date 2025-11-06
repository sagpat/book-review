// NotificationCenter.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  BookmarkAdd,
  RateReview,
  Info,
  MarkEmailRead,
  Clear,
} from '@mui/icons-material';
// Utility function to format time ago
const formatTimeAgo = (date: string) => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInMs = now.getTime() - notificationDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return notificationDate.toLocaleDateString();
};
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import {
  fetchUserNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
  clearNotifications,
} from '../../features/notifications/notificationsSlice';

const NotificationCenter: React.FC = () => {
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showAll, setShowAll] = useState(false);
  
  const authToken = localStorage.getItem('token');
  const userId = useAppSelector((state) => state.auth.id);
  const {
    notifications,
    unreadCount,
    loading,
    error,
  } = useAppSelector((state) => state.notifications);

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (userId && authToken) {
      dispatch(fetchUserNotifications({ userId: userId.toString(), token: authToken }));
      dispatch(fetchUnreadCount({ userId: userId.toString(), token: authToken }));

      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        dispatch(fetchUnreadCount({ userId: userId.toString(), token: authToken }));
      }, 30000);

      return () => clearInterval(interval);
    }

    return () => {
      dispatch(clearNotifications());
    };
  }, [dispatch, userId, authToken]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (!showAll && userId && authToken) {
      dispatch(fetchUserNotifications({ userId: userId.toString(), token: authToken }));
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (notificationId: string) => {
    if (authToken) {
      dispatch(markNotificationAsRead({ notificationId, token: authToken }));
    }
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    // Here you could also make an API call to mark all as read on the server
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'book_recommendation':
        return <BookmarkAdd color="primary" />;
      case 'new_review':
        return <RateReview color="secondary" />;
      case 'system_update':
        return <Info color="info" />;
      default:
        return <Notifications />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'book_recommendation':
        return 'primary';
      case 'new_review':
        return 'secondary';
      case 'system_update':
        return 'info';
      default:
        return 'default';
    }
  };

  // Ensure notifications is always an array
  const notificationsArray = Array.isArray(notifications) ? notifications : [];
  const displayNotifications = showAll ? notificationsArray : notificationsArray.slice(0, 5);
  const unreadNotifications = notificationsArray.filter(n => !n.isRead);

  return (
    <Box>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="notifications"
        aria-controls={open ? 'notification-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <NotificationsActive /> : <Notifications />}
        </Badge>
      </IconButton>

      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 400,
            maxHeight: 600,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Notifications
            </Typography>
            {unreadNotifications.length > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                startIcon={<MarkEmailRead />}
              >
                Mark all read
              </Button>
            )}
          </Box>
          {unreadNotifications.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {unreadNotifications.length} unread notification{unreadNotifications.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Notifications List */}
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {loading.notifications ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error.notifications ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error" variant="outlined">
                {error.notifications}
              </Alert>
            </Box>
          ) : displayNotifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {displayNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: notification.isRead ? 'grey.300' : `${getNotificationColor(notification.type)}.main`,
                          color: notification.isRead ? 'grey.600' : 'white',
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: notification.isRead ? 'normal' : 'bold',
                              flex: 1,
                            }}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.isRead && (
                            <Chip
                              label="New"
                              size="small"
                              color="primary"
                              variant="filled"
                              sx={{ fontSize: '0.75rem', height: 20 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeAgo(notification.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    {!notification.isRead && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        aria-label="mark as read"
                      >
                        <Clear fontSize="small" />
                      </IconButton>
                    )}
                  </ListItem>
                  {index < displayNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {notificationsArray.length > 5 && !showAll && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                size="small"
                onClick={() => setShowAll(true)}
              >
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default NotificationCenter;