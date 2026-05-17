import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MapPin, CheckCircle, Star } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

type CreatorProfile = {
  id: string;
  display_name: string;
  niche_industry: string;
  avatar_url: string | null;
  portfolio_thumbnail_url: string | null;
  bio: string | null;
  location: string | null;
  base_price: number | null;
  status: string;
};

export const CreatorProfileScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { creator_id } = route.params || {};

  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (creator_id) {
      fetchCreator();
    } else {
      Alert.alert('Error', 'No creator specified.');
      navigation.goBack();
    }
  }, [creator_id]);

  const fetchCreator = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', creator_id)
        .single();

      if (error) throw error;
      setCreator(data);
    } catch (err: any) {
      console.error('Error fetching creator:', err);
      Alert.alert('Error', 'Could not load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDraftOffer = () => {
    // Navigate to Campaign Builder and pass the prefill_creator_id
    navigation.navigate('CampaignBuilder', { prefill_creator_id: creator?.id });
  };

  if (loading || !creator) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Mock portfolio grid images using picsum to simulate past work
  const mockPortfolioImages = [
    `https://picsum.photos/seed/${creator.id}_1/300/300`,
    `https://picsum.photos/seed/${creator.id}_2/300/300`,
    `https://picsum.photos/seed/${creator.id}_3/300/300`,
    `https://picsum.photos/seed/${creator.id}_4/300/300`,
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Section */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: creator.portfolio_thumbnail_url || 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800' }}
            style={{ width: '100%', height: 280, backgroundColor: '#E5E7EB' }}
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              position: 'absolute',
              top: 50,
              left: 20,
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: 10,
              borderRadius: 20,
            }}
          >
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={{ padding: 20, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: -50, marginBottom: 16 }}>
            <Image
              source={{ uri: creator.avatar_url || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=200' }}
              style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                borderWidth: 4,
                borderColor: '#FFF',
                backgroundColor: '#E5E7EB',
              }}
            />
            <View style={{ marginLeft: 16, paddingBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: '#000' }}>
                  {creator.display_name}
                </Text>
                <CheckCircle size={20} color="#3B82F6" style={{ marginLeft: 6 }} />
              </View>
              <Text style={{ fontSize: 15, color: '#6B7280', marginTop: 2, fontWeight: '500' }}>
                {creator.niche_industry}
              </Text>
            </View>
          </View>

          {creator.location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <MapPin size={16} color="#6B7280" />
              <Text style={{ color: '#6B7280', marginLeft: 6, fontSize: 14 }}>{creator.location}</Text>
            </View>
          )}

          <Text style={{ fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 8 }}>About</Text>
          <Text style={{ fontSize: 15, color: '#4B5563', lineHeight: 24, marginBottom: 24 }}>
            {creator.bio || "This creator hasn't written a bio yet. But based on their niche, they are an excellent match for your next campaign!"}
          </Text>

          <Text style={{ fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 12 }}>Past Work</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {mockPortfolioImages.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={{
                  width: (width - 50) / 2,
                  height: (width - 50) / 2,
                  borderRadius: 12,
                  marginBottom: 10,
                  backgroundColor: '#E5E7EB'
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 36,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 10,
      }}>
        <View>
          <Text style={{ fontSize: 13, color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>Starting at</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#000' }}>
            {creator.base_price ? `₹${creator.base_price.toLocaleString()}` : 'Negotiable'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleDraftOffer}
          style={{
            backgroundColor: '#000',
            paddingVertical: 14,
            paddingHorizontal: 24,
            borderRadius: 100,
          }}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Draft Campaign Offer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
