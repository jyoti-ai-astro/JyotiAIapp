/**
 * Auth Flow Utilities
 * 
 * Centralized auth flow logic and redirects
 */

'use client';

import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';

export function useAuthFlow() {
  const router = useRouter();
  const { user } = useUserStore();

  const redirectToNextStep = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!user.onboarded) {
      // Check which step they're on
      if (!user.dob || !user.pob) {
        router.push('/profile-setup');
      } else if (!user.rashi) {
        router.push('/rasi-confirmation');
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  };

  const handleLoginSuccess = (onboarded: boolean, isAdmin?: boolean) => {
    // Redirect admin users to admin dashboard
    if (isAdmin) {
      router.push('/admin/dashboard');
      return;
    }
    
    if (onboarded) {
      router.push('/dashboard');
    } else {
      redirectToNextStep();
    }
  };

  const handleSignupSuccess = () => {
    router.push('/profile-setup');
  };

  const handleProfileSetupSuccess = () => {
    router.push('/rasi-confirmation');
  };

  const handleRasiConfirmationSuccess = () => {
    router.push('/dashboard');
  };

  return {
    redirectToNextStep,
    handleLoginSuccess,
    handleSignupSuccess,
    handleProfileSetupSuccess,
    handleRasiConfirmationSuccess,
  };
}

