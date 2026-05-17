import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  RefreshControl 
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Check, X, UserX } from 'lucide-react-native';

type UserProfile = {
  id: string;
  display_name: string;
  role: 'admin' | 'brand' | 'influencer';
  status: 'pending' | 'approved' | 'suspended';
  niche_industry: string;
  created_at: string;
};

export const AdminVetting = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let query = supabase.from('profiles').select('*');

      if (activeTab === 'pending') {
        query = query.eq('status', 'pending');
      } else {
        query = query.eq('status', 'approved').neq('role', 'admin');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const updateUserStatus = async (userId: string, newStatus: 'approved' | 'suspended') => {
    // Optimistic Update
    const previousUsers = [...users];
    setUsers(users.filter(u => u.id !== userId));

    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId);

    if (error) {
      setUsers(previousUsers);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const handleRevoke = (userId: string, name: string) => {
    Alert.alert(
      'Revoke Access',
      `Are you sure you want to ban ${name}? They will no longer be able to access the app.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Revoke', 
          style: 'destructive',
          onPress: () => updateUserStatus(userId, 'suspended') 
        }
      ]
    );
  };

  const renderUserItem = ({ item }: { item: UserProfile }) => (
    <View className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg font-bold text-black mr-2">{item.display_name}</Text>
            <View className={`px-2 py-0.5 rounded-full ${item.role === 'brand' ? 'bg-blue-100' : 'bg-purple-100'}`}>
              <Text className={`text-[10px] font-bold uppercase ${item.role === 'brand' ? 'text-blue-600' : 'text-purple-600'}`}>
                {item.role}
              </Text>
            </View>
          </View>
          <Text className="text-gray-500 text-sm mb-1">{item.niche_industry || 'No industry specified'}</Text>
          {activeTab === 'active' && (
            <Text className="text-gray-400 text-xs">Joined {new Date(item.created_at).toLocaleDateString()}</Text>
          )}
        </View>

        <View className="flex-row">
          {activeTab === 'pending' ? (
            <>
              <TouchableOpacity 
                onPress={() => updateUserStatus(item.id, 'approved')}
                className="bg-green-100 p-2 rounded-full mr-2"
              >
                <Check size={20} color="#16A34A" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => updateUserStatus(item.id, 'suspended')}
                className="bg-red-100 p-2 rounded-full"
              >
                <X size={20} color="#DC2626" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              onPress={() => handleRevoke(item.id, item.display_name)}
              className="bg-gray-100 p-2 rounded-full"
            >
              <UserX size={20} color="#4B5563" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 60 }}>
      <View className="mb-6">
        <Text className="text-3xl font-bold text-black">Vetting Queue</Text>
        <Text className="text-gray-500 mt-1">Manage marketplace participants</Text>
      </View>

      {/* Segmented Control */}
      <View className="flex-row bg-gray-200 p-1 rounded-xl mb-6">
        <TouchableOpacity 
          onPress={() => setActiveTab('pending')}
          className="flex-1 py-2 rounded-lg items-center"
          style={{ backgroundColor: activeTab === 'pending' ? 'white' : 'transparent' }}
        >
          <Text className={`font-semibold ${activeTab === 'pending' ? 'text-black' : 'text-gray-500'}`}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('active')}
          className="flex-1 py-2 rounded-lg items-center"
          style={{ backgroundColor: activeTab === 'active' ? 'white' : 'transparent' }}
        >
          <Text className={`font-semibold ${activeTab === 'active' ? 'text-black' : 'text-gray-500'}`}>
            Active
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-gray-400 text-center">
                {activeTab === 'pending' ? 'No pending users at this time' : 'No active users found'}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
};
