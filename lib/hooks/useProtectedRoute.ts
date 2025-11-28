/**
 * Protected Route Hook
 * 
 * Handles route protection and redirects based on auth state
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

interface UseProtectedRouteOptions {
  requireAuth?: boolean;
  requireOnboarded?: boolean;
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const {
    requireAuth = true,
    requireOnboarded = false,
    redirectTo,
    redirectIfAuthenticated = false,
  } = options;

  const router = useRouter();
  const { user, loading, isAuthenticated, isOnboarded } = useAuth({
    requireAuth: false,
  });
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    if (loading || hasRedirected) return;

    // Redirect if authenticated (for login/signup pages)
    if (redirectIfAuthenticated && isAuthenticated) {
      setHasRedirected(true);
      if (isOnboarded) {
        router.push(redirectTo || '/dashboard');
      } else {
        router.push('/profile-setup');
      }
      return;
    }

    // Require authentication
    if (requireAuth && !isAuthenticated) {
      setHasRedirected(true);
      router.push(redirectTo || '/login');
      return;
    }

    // Require onboarding
    if (requireOnboarded && isAuthenticated && !isOnboarded) {
      setHasRedirected(true);
      router.push('/profile-setup');
      return;
    }
  }, [
    loading,
    isAuthenticated,
    isOnboarded,
    requireAuth,
    requireOnboarded,
    redirectTo,
    redirectIfAuthenticated,
    router,
    hasRedirected,
  ]);

  return {
    user,
    loading,
    isAuthenticated,
    isOnboarded,
  };
}

