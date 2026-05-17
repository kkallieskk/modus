import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle2, TrendingUp, Wallet, Users, Zap } from 'lucide-react-native';

interface DashboardStats {
  gmv: number;
  revenue: number;
  activeDeals: number;
  pendingActions: number;
  approvedBrands: number;
  approvedInfluencers: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch campaigns for deal metrics
      const { data: campaigns, error: campaignError } = await supabase
        .from('campaigns')
        .select('status, budget');

      if (campaignError) throw campaignError;

      // 2. Fetch profiles for health metrics
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('role, status');

      if (profileError) throw profileError;

      // 3. Aggregate Data
      const aggregated: DashboardStats = {
        gmv: campaigns
          .filter(c => c.status === 'completed')
          .reduce((sum, c) => sum + (Number(c.budget) || 0), 0),
        revenue: 0, // platform_commission column is missing from DB
        activeDeals: campaigns.filter(c => c.status === 'active' || c.status === 'submitted').length,
        pendingActions: campaigns.filter(c => c.status === 'pending_admin').length,
        approvedBrands: profiles.filter(p => p.role === 'brand' && p.status === 'approved').length,
        approvedInfluencers: profiles.filter(p => p.role === 'influencer' && p.status === 'approved').length,
      };

      setStats(aggregated);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const KPICard = ({ title, value, icon: Icon, color, prefix = '' }: any) => (
    <View className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-gray-100 flex-1 mx-1 justify-between min-h-[140px]">
      <View className={`w-10 h-10 rounded-2xl ${color} items-center justify-center mb-3`}>
        <Icon size={20} color="white" />
      </View>
      <View>
        <Text className="text-gray-400 text-xs font-bold uppercase mb-1">{title}</Text>
        {loading ? (
          <View className="h-6 w-20 bg-gray-100 rounded" />
        ) : (
          <Text className="text-xl font-bold text-black">
            {prefix}{value.toLocaleString()}
          </Text>
        )}
      </View>
    </View>
  );

  const HealthMetric = ({ title, value, icon: Icon, color }: any) => (
    <View className="flex-row items-center bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm">
      <View className={`w-10 h-10 rounded-full ${color} items-center justify-center mr-4`}>
        <Icon size={18} color="white" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-sm">{title}</Text>
        <Text className="text-lg font-bold text-black">{value}</Text>
      </View>
      <View className="bg-green-50 px-3 py-1 rounded-full">
        <Text className="text-green-600 text-[10px] font-bold">LIVE</Text>
      </View>
    </View>
  );

  return (
    <ScrollView 
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="mb-8">
        <Text className="text-3xl font-bold text-black">Command Center</Text>
        <Text className="text-gray-500 mt-1">Real-time marketplace performance</Text>
      </View>

      {/* 2x2 Grid */}
      <View className="mb-6">
        <View className="flex-row mb-2">
          <KPICard 
            title="GMV" 
            value={stats?.gmv || 0} 
            prefix="$" 
            icon={TrendingUp} 
            color="bg-emerald-500" 
          />
          <KPICard 
            title="Revenue" 
            value={stats?.revenue || 0} 
            prefix="$" 
            icon={Wallet} 
            color="bg-indigo-500" 
          />
        </View>
        <View className="flex-row">
          <KPICard 
            title="Active Deals" 
            value={stats?.activeDeals || 0} 
            icon={Zap} 
            color="bg-orange-500" 
          />
          <KPICard 
            title="Pending" 
            value={stats?.pendingActions || 0} 
            icon={AlertCircle} 
            color="bg-rose-500" 
          />
        </View>
      </View>

      <View className="mt-4">
        <Text className="text-xl font-bold text-black mb-4">Platform Health</Text>
        <HealthMetric 
          title="Approved Brands" 
          value={stats?.approvedBrands || 0} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <HealthMetric 
          title="Approved Influencers" 
          value={stats?.approvedInfluencers || 0} 
          icon={Users} 
          color="bg-purple-500" 
        />
      </View>

      {/* Recent Activity Footer */}
      <View className="mt-10 items-center">
        <View className="w-12 h-1 bg-gray-200 rounded-full mb-4" />
        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">Modus Engine v1.0</Text>
      </View>
    </ScrollView>
  );
};
