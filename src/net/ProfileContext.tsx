/**
 * Single shared profile state for the whole app. Without it, every screen
 * that mounted its own useProfile() repeated the profile POST and the
 * secure-storage write — the provider runs that once at startup.
 */
import { createContext, useContext, type ReactNode } from 'react';
import { useProfile, type Profile } from './profile';

interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  refresh: (name?: string) => Promise<Profile | null>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const value = useProfile();
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileContext(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfileContext must be used within ProfileProvider');
  return ctx;
}
