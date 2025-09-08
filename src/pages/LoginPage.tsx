import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Shield, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading, sendOTP, login } = useAuthStore();
  const { addNotification } = useAppStore();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setError('');
    try {
      await sendOTP(email);
      setStep('otp');
      addNotification({
        type: 'success',
        title: 'Verification Code Sent',
        message: `Check your email at ${email} for the verification code.`,
        duration: 5000
      });
    } catch (error) {
      setError('Failed to send verification code. Please try again.');
      console.error('Send OTP error:', error);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    
    setError('');
    try {
      await login(email, otpCode);
      addNotification({
        type: 'success',
        title: 'Welcome to KAIROS!',
        message: 'Successfully logged in. Ready to create strategic documents.',
        duration: 3000
      });
    } catch (error) {
      setError('Invalid verification code. Please try again.');
      console.error('Verify OTP error:', error);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtpCode('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">KAIROS</h1>
              <p className="text-sm text-muted-foreground font-medium">Intelligent Strategic Document Platform</p>
            </div>
          </div>
          <p className="text-muted-foreground">
            Transform strategic planning with AI-powered document generation
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">
              {step === 'email' ? 'Sign In' : 'Verify Email'}
            </CardTitle>
            <CardDescription>
              {step === 'email' 
                ? 'Enter your email to receive a verification code'
                : `Enter the verification code sent to ${email}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 'email' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="pl-10 text-center text-lg tracking-wider"
                      maxLength={6}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !otpCode.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Verify & Sign In
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full"
                    onClick={handleBackToEmail}
                    disabled={isLoading}
                  >
                    Back to Email
                  </Button>
                </div>
              </form>
            )}

            {/* Features Preview */}
            <div className="mt-6 pt-6 border-t space-y-3">
              <p className="text-sm font-medium text-center mb-3">Enterprise Features Include:</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>AI-powered business case & roadmap generation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  <span>Strategic document suite (Charter, SOW, RFP)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Enterprise exports & SharePoint integration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  <span>Real-time collaboration & team management</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};