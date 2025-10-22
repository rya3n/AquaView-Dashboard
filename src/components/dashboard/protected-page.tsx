"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Droplets } from 'lucide-react';

type ProtectedPageProps = {
  children: React.ReactNode;
};

const AUTH_KEY = 'acquaview-auth-validated';

export default function ProtectedPage({ children }: ProtectedPageProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Don't run verification logic on the login page itself
    if (pathname === '/login') {
        setIsVerified(true); // Allow login page to render
        return;
    }

    // Wait until Firebase auth state is resolved
    if (isUserLoading) {
      return;
    }

    const sessionIsValid = sessionStorage.getItem(AUTH_KEY) === 'true';

    // If there's no user OR the session isn't validated, redirect to login
    if (!user || !sessionIsValid) {
      // Clear any invalid state before redirecting
      sessionStorage.removeItem(AUTH_KEY);
      router.push('/login');
    } else {
      // If user exists and session is valid, allow access
      setIsVerified(true);
    }
  }, [user, isUserLoading, router, pathname]);

  // While checking, show a loading screen
  if (!isVerified || isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Droplets className="h-10 w-10 animate-pulse text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // If verified, render the protected content
  return <>{children}</>;
}
