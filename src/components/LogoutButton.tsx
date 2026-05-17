import React from 'react';
import { TouchableOpacity } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export const LogoutButton = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <TouchableOpacity 
      onPress={handleLogout}
      style={{ marginRight: 15 }}
    >
      <LogOut size={20} color="#000" />
    </TouchableOpacity>
  );
};
