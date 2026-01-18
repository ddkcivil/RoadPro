import React, { useState } from "react";
import { Badge, IconButton, Popover, List, ListItem, ListItemText, ListItemIcon, Divider, Box, Typography, Button, Chip } from '@mui/material';
import { Bell, Check, CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationsBadge: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  
  // Early return if context is not ready
  if (!notifications) {
    return (
      <IconButton color="inherit" size="small" disabled>
        <Bell size={20} />
      </IconButton>
    );
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} color="#10b981" />;
      case 'warning':
        return <AlertCircle size={16} color="#f59e0b" />;
      case 'error':
        return <AlertCircle size={16} color="#ef4444" />;
      case 'info':
      default:
        return <Info size={16} color="#3b82f6" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      case 'info':
      default:
        return '#3b82f6';
    }
  };

  return (
    <>
      <IconButton onClick={handleClick} color="inherit" size="small">
        <Badge badgeContent={unreadCount} color="error">
          <Bell size={20} />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 400, maxWidth: '90vw', borderRadius: 3, mt: 1 }
        }}
      >
        <Box p={2} borderBottom="1px solid" borderColor="divider" display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">Notifications</Typography>
          {notifications.length > 0 && (
            <Button 
              size="small" 
              onClick={() => {
                markAllAsRead();
              }}
              startIcon={<Check size={14} />}
            >
              Mark All Read
            </Button>
          )}
        </Box>
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="No notifications" 
                secondary="You're all caught up!" 
                primaryTypographyProps={{ color: 'text.secondary', textAlign: 'center' }}
                secondaryTypographyProps={{ color: 'text.secondary', textAlign: 'center' }}
              />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  sx={{ 
                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                    borderLeft: `3px solid ${getTypeColor(notification.type)}`,
                    pl: 3
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 30, color: getTypeColor(notification.type) }}>
                    {getIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" fontWeight="bold">{notification.title}</Typography>
                        {!notification.read && (
                          <Chip 
                            label="New" 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                            sx={{ height: 18, fontSize: '0.6rem' }} 
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.timestamp).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" mt={0.5}>{notification.message}</Typography>
                      </React.Fragment>
                    }
                  />
                  <Box display="flex" gap={1}>
                    {!notification.read && (
                      <IconButton 
                        size="small" 
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </IconButton>
                    )}
                    <IconButton 
                      size="small" 
                      onClick={() => removeNotification(notification.id)}
                      title="Dismiss"
                    >
                      <X size={14} />
                    </IconButton>
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationsBadge;