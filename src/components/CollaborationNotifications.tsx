import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  MessageSquare, 
  Edit3, 
  Clock, 
  X,
  Bell,
  Check,
  UserPlus,
  UserMinus,
  FileText,
  Lock,
  Unlock
} from 'lucide-react';
import { useCollaborationStore } from '@/store/collaboration-store';
import { useAppStore } from '@/store/app-store';

interface NotificationItem {
  id: string;
  type: 'user_joined' | 'user_left' | 'edit_made' | 'comment_added' | 'lock_acquired' | 'lock_released' | 'version_saved';
  title: string;
  message: string;
  timestamp: number;
  userId?: string;
  userName?: string;
  documentId?: string;
  read: boolean;
}

export const CollaborationNotifications: React.FC = () => {
  const { auth } = useAppStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get collaboration store callbacks
  const {
    onEditReceived,
    onUserJoined,
    onUserLeft,
    onCommentAdded,
    onLockAcquired,
    onLockReleased
  } = useCollaborationStore();

  // Add notification helper
  const addNotification = (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50 notifications
    setUnreadCount(prev => prev + 1);

    // Auto-hide after 5 seconds for certain types
    if (['edit_made', 'user_joined', 'user_left'].includes(notification.type)) {
      setTimeout(() => {
        markAsRead(newNotification.id);
      }, 5000);
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Set up collaboration listeners
  useEffect(() => {
    // Store original callbacks
    const originalOnEditReceived = onEditReceived;
    const originalOnUserJoined = onUserJoined;
    const originalOnUserLeft = onUserLeft;
    const originalOnCommentAdded = onCommentAdded;
    const originalOnLockAcquired = onLockAcquired;
    const originalOnLockReleased = onLockReleased;

    // Override with notification-aware callbacks
    useCollaborationStore.setState({
      onEditReceived: (edit) => {
        if (edit.user_id !== auth.user?.uid) {
          addNotification({
            type: 'edit_made',
            title: 'Document Updated',
            message: `${edit.user_name} made changes`,
            userId: edit.user_id,
            userName: edit.user_name,
            documentId: edit.document_id
          });
        }
        originalOnEditReceived?.(edit);
      },

      onUserJoined: (presence) => {
        if (presence.user_id !== auth.user?.uid) {
          addNotification({
            type: 'user_joined',
            title: 'User Joined',
            message: `${presence.user_name} started editing`,
            userId: presence.user_id,
            userName: presence.user_name,
            documentId: presence.document_id
          });
        }
        originalOnUserJoined?.(presence);
      },

      onUserLeft: (userId) => {
        addNotification({
          type: 'user_left',
          title: 'User Left',
          message: 'A user stopped editing',
          userId
        });
        originalOnUserLeft?.(userId);
      },

      onCommentAdded: (comment) => {
        if (comment.author_id !== auth.user?.uid) {
          addNotification({
            type: 'comment_added',
            title: 'New Comment',
            message: `${comment.author_name} added a comment`,
            userId: comment.author_id,
            userName: comment.author_name,
            documentId: comment.document_id
          });
        }
        originalOnCommentAdded?.(comment);
      },

      onLockAcquired: (lock) => {
        if (lock.locked_by !== auth.user?.uid) {
          addNotification({
            type: 'lock_acquired',
            title: 'Document Locked',
            message: `${lock.locked_by_name} acquired editing lock`,
            userId: lock.locked_by,
            userName: lock.locked_by_name,
            documentId: lock.document_id
          });
        }
        originalOnLockAcquired?.(lock);
      },

      onLockReleased: (documentId) => {
        addNotification({
          type: 'lock_released',
          title: 'Document Unlocked',
          message: 'Document is now available for editing',
          documentId
        });
        originalOnLockReleased?.(documentId);
      }
    });

    // Cleanup: restore original callbacks
    return () => {
      useCollaborationStore.setState({
        onEditReceived: originalOnEditReceived,
        onUserJoined: originalOnUserJoined,
        onUserLeft: originalOnUserLeft,
        onCommentAdded: originalOnCommentAdded,
        onLockAcquired: originalOnLockAcquired,
        onLockReleased: originalOnLockReleased
      });
    };
  }, [auth.user]);

  // Get notification icon
  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'user_joined':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'user_left':
        return <UserMinus className="h-4 w-4 text-orange-500" />;
      case 'edit_made':
        return <Edit3 className="h-4 w-4 text-blue-500" />;
      case 'comment_added':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'lock_acquired':
        return <Lock className="h-4 w-4 text-red-500" />;
      case 'lock_released':
        return <Unlock className="h-4 w-4 text-green-500" />;
      case 'version_saved':
        return <FileText className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Panel */}
      {showNotifications && (
        <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Collaboration Activity</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="max-h-96">
              {notifications.length > 0 ? (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b hover:bg-muted cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          {notification.userName && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs">
                                  {notification.userName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {notification.userName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    No notifications
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Collaboration activity will appear here
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};