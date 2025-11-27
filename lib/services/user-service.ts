/**
 * User Service - Client-side API calls for user management
 */

export interface UserProfile {
  uid: string
  name: string | null
  email: string | null
  photo: string | null
  dob: string | null
  tob: string | null
  pob: string | null
  lat?: number
  lng?: number
  timezone?: string
  rashi: string | null
  rashiPreferred?: 'moon' | 'sun' | 'ascendant'
  rashiMoon?: string
  rashiSun?: string
  ascendant?: string
  nakshatra: string | null
  subscription: 'free' | 'pro'
  subscriptionExpiry: Date | null
  onboarded: boolean
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const response = await fetch('/api/user/get', {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.user || null
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
  try {
    const response = await fetch('/api/user/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updates),
    })

    return response.ok
  } catch (error) {
    console.error('Update user error:', error)
    return false
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })

    return response.ok
  } catch (error) {
    console.error('Logout error:', error)
    return false
  }
}

