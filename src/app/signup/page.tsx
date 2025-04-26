'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert"; // For displaying errors/success

type UserType = 'corporate' | 'startup' | 'freelancer';

export default function SignUpPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>('startup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    if (!fullName || !email || !password) {
      return "Please fill in your name, email, and password.";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }
    if (password.length < 8) { // Example: Minimum password length
      return "Password must be at least 8 characters long.";
    }
    if ((userType === 'corporate' || userType === 'startup') && !companyName) {
      return "Please enter your company name.";
    }
    if (!agreedToTerms) {
      return "You must agree to the Terms of Service and Privacy Policy.";
    }
    return null; // No errors
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    const payload = {
      full_name: fullName,
      email,
      password,
      role: userType === 'corporate' ? 'CORP_ADMIN' : userType === 'startup' ? 'STARTUP_ADMIN' : 'FREELANCER',
      company_name: (userType === 'corporate' || userType === 'startup') ? companyName : undefined,
      title: roleTitle || undefined,
    };

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.detail ?? 'Registration failed. Please try again.');
      }

      router.push('/auth/check-email');

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>Join ShareYourSpace and start connecting.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div className="space-y-2">
              <Label>I am signing up as a:</Label>
              <RadioGroup
                defaultValue={userType}
                onValueChange={(value: UserType) => setUserType(value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="corporate" id="corporate" />
                  <Label htmlFor="corporate">Corporate Rep</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="startup" id="startup" />
                  <Label htmlFor="startup">Startup Rep</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="freelancer" id="freelancer" />
                  <Label htmlFor="freelancer">Freelancer</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                type="text" 
                placeholder="Your full name" 
                required 
                value={fullName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="********" 
                required 
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                minLength={8}
                disabled={isLoading}
              />
            </div>

            {/* Conditional Fields */}
            {(userType === 'corporate' || userType === 'startup') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    type="text" 
                    placeholder="Your Company Inc." 
                    required 
                    value={companyName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roleTitle">Role / Title (Optional)</Label>
                  <Input 
                    id="roleTitle" 
                    type="text" 
                    placeholder="e.g., CEO, Founder, Manager" 
                    value={roleTitle}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setRoleTitle(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {/* Terms and Conditions */}
            <div className="items-top flex space-x-2">
                <Checkbox 
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  aria-label="Agree to terms and conditions"
                  disabled={isLoading}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Accept Terms & Conditions
                  </label>
                  <p className="text-sm text-muted-foreground">
                    You agree to our <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
                  </p>
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          Already have an account? <Link href="/login" className="underline ml-1">Login</Link>
        </CardFooter>
      </Card>
    </div>
  );
} 