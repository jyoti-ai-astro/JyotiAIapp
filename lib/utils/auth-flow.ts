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
      router.push('/onboarding');
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
    router.push('/onboarding');
  };

  const handleProfileSetupSuccess = () => {
    router.push('/onboarding');
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
