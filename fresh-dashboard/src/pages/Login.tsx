import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { signIn } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted', { email, password: '***' });
    setLoading(true);

    try {
      // Trim and validate email
      const trimmedEmail = email.trim().toLowerCase();
      
      if (!trimmedEmail) {
        console.log('Email validation failed');
        toast({
          title: 'Email Required',
          description: 'Please enter your email address.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (!password) {
        console.log('Password validation failed');
        toast({
          title: 'Password Required',
          description: 'Please enter your password.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      console.log('Calling signIn function...');
      const { error } = await signIn(trimmedEmail, password);
      console.log('SignIn result:', { error });

      if (error) {
        // Provide specific error messages
        let errorMessage = 'Unable to sign in. Please try again.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before signing in.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a moment and try again.';
        }

        console.error('Login error:', error.message);
        toast({
          title: 'Sign In Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      } else {
        console.log('Login successful, redirecting...');
        toast({
          title: 'Welcome back!',
          description: 'Successfully signed in.',
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Orange Logo - 400px width */}
        <div className="flex justify-center mb-8">
          <img 
            src="/assets/e_logo.png" 
            alt="ë Logo" 
            className="w-[400px] h-auto object-contain"
          />
        </div>

        <Card className="card-minimal border-white/10">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl uppercase tracking-wider text-white">Sign In</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="input-minimal bg-black text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="input-minimal bg-black text-white"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-primary-minimal"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="divider-minimal" />

              <div className="space-y-3 text-center text-sm">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider text-xs"
                >
                  Forgot Password?
                </button>
                <div className="text-muted-foreground text-xs">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Port Louis, MU • 230
          </p>
        </div>
      </div>
    </div>
  );
}