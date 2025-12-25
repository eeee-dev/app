import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check, AlertTriangle, DollarSign, FileText, ShoppingCart, Calendar } from 'lucide-react';
import { useState } from 'react';

interface Notification {
  id: string;
  type: 'invoice' | 'budget' | 'purchase_order' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'invoice',
      title: 'Invoice Overdue',
      message: 'Invoice #INV-2024-001 from Vendor Corp is 5 days overdue',
      timestamp: '2 hours ago',
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'budget',
      title: 'Budget Warning',
      message: 'Marketing department has exceeded 90% of monthly budget',
      timestamp: '5 hours ago',
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'purchase_order',
      title: 'PO Approval Required',
      message: 'Purchase Order #PO-2024-015 requires your approval',
      timestamp: '1 day ago',
      read: true,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'system',
      title: 'System Update',
      message: 'Financial reports have been successfully generated for Q1 2024',
      timestamp: '2 days ago',
      read: true,
      priority: 'low'
    },
    {
      id: '5',
      type: 'reminder',
      title: 'Tax Filing Reminder',
      message: 'VAT return for March 2024 is due in 3 days',
      timestamp: '3 days ago',
      read: true,
      priority: 'high'
    },
    {
      id: '6',
      type: 'invoice',
      title: 'Payment Received',
      message: 'Payment of MUR 125,000 received for Invoice #INV-2024-008',
      timestamp: '4 days ago',
      read: true,
      priority: 'low'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'invoice':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'budget':
        return <DollarSign className="h-5 w-5 text-amber-500" />;
      case 'purchase_order':
        return <ShoppingCart className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-gray-500" />;
      case 'reminder':
        return <Calendar className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityBadge = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-600 border-amber-500/30">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Low</Badge>;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-8 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <CardDescription>Alerts and updates for your financial dashboard</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-secondary/50 transition-colors ${
                    !notification.read ? 'bg-blue-500/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark as read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-lg font-bold">{unreadCount}</div>
              <div className="text-xs text-muted-foreground">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{notifications.filter(n => n.priority === 'high').length}</div>
              <div className="text-xs text-muted-foreground">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{notifications.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Notifications;