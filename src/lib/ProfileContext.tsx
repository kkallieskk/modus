import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

type Profile = {
  id: string;
  role: string;
  display_name: string;
  avatar_url: string;
  brand_color: string;
  onboarding_completed: boolean;
  industry: string;
  bio: string;
  website_url: string;
};

type ProfileContextType = {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateBrandColor: (color: string) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, display_name, avatar_url, brand_color, onboarding_completed, industry, bio, website_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') fetchProfile();
      if (event === 'SIGNED_OUT') setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const updateBrandColor = async (color: string) => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ brand_color: color })
        .eq('id', profile.id);
      
      if (error) throw error;
      setProfile(prev => prev ? { ...prev, brand_color: color } : null);
    } catch (err) {
      console.error('Error updating brand color:', err);
      throw err;
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile, updateBrandColor }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
