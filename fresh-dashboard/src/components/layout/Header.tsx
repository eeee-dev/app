import { Bell, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Financial Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover:bg-white/5">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
          </Button>

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
              <DropdownMenuItem className="text-sm hover:bg-white/5 cursor-pointer">
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