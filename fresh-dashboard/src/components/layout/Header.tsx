import { Bell, LogOut, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  created_at: string;
  read: boolean;
}

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Set current date
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    setCurrentDate(now.toLocaleDateString('en-US', options));

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // Mock notifications - in production, fetch from Supabase
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'New Expense Submitted',
          message: 'Marketing department submitted a new expense for approval',
          type: 'info',
          created_at: new Date().toISOString(),
          read: false
        },
        {
          id: '2',
          title: 'Budget Alert',
          message: 'Department budget utilization exceeded 90%',
          type: 'warning',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          read: false
        },
        {
          id: '3',
          title: 'Payment Received',
          message: 'Invoice payment of ₨50,000 received',
          type: 'success',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          read: true
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleProfileClick = () => {
    navigate('/settings');
    toast({
      title: 'Profile',
      description: 'Opening profile settings...',
    });
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    toast({
      title: 'Marked as read',
      description: 'Notification marked as read',
    });
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({
      title: 'Deleted',
      description: 'Notification deleted',
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Financial Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Date and Time Display */}
          <div className="hidden md:flex items-center gap-3 text-muted-foreground border-r border-white/10 pr-4">
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider">{currentDate}</div>
              <div className="text-sm font-mono font-medium text-primary flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(currentTime)}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-white/5">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-card border-white/10 p-0" align="end">
              <div className="border-b border-white/10 p-4">
                <h3 className="font-semibold uppercase tracking-wider text-sm">Notifications</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-white/5 transition-colors ${
                          !notification.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                              {!notification.read && (
                                <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(notification.created_at).toLocaleTimeString()}
                              </span>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs hover:bg-white/10"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  Mark as read
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-destructive hover:bg-white/10"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="border-t border-white/10 p-2">
                  <Button
                    variant="ghost"
                    className="w-full text-xs hover:bg-white/5"
                    onClick={() => navigate('/settings?tab=notifications')}
                  >
                    View all notifications
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="btn-minimal gap-2">
                <User className="h-5 w-5" />
                <span className="text-xs uppercase tracking-wider">
                  {user?.email?.split('@')[0] || 'User'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-white/10">
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                className="text-sm hover:bg-white/5 cursor-pointer"
                onClick={handleProfileClick}
              >
                <User className="mr-2 h-4 w-4" />
                <span className="uppercase tracking-wider text-xs">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/settings')}
                className="text-sm hover:bg-white/5 cursor-pointer"
              >
                <span className="uppercase tracking-wider text-xs">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="text-sm hover:bg-white/5 cursor-pointer text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="uppercase tracking-wider text-xs">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}