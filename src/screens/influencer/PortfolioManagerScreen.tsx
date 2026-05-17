import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { 
  Plus, 
  Trash2, 
  Video, 
  Image as ImageIcon, 
  ChevronLeft,
  MoreHorizontal,
  Eye,
  LayoutGrid
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 60) / 2;

// Mock Portfolio Data
const MOCK_PORTFOLIO = [
  {
    id: '1',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop',
    title: 'Clean Beauty Morning Routine',
    views: '1.2M'
  },
  {
    id: '2',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=400&auto=format&fit=crop',
    title: 'Summer Skincare Favorites',
    views: '850K'
  },
  {
    id: '3',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1512413316925-fd4793431f11?q=80&w=400&auto=format&fit=crop',
    title: 'Fitness Tech Review',
    views: '2.4M'
  }
];

export const PortfolioManagerScreen = () => {
  const navigation = useNavigation();
  const [portfolio, setPortfolio] = useState(MOCK_PORTFOLIO);
  const [loading, setLoading] = useState(false);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Remove from Portfolio?',
      'This will hide the work from brands looking at your profile.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: () => setPortfolio(prev => prev.filter(item => item.id !== id)) 
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: typeof MOCK_PORTFOLIO[0] }) => (
    <View style={styles.portfolioCard}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.cardOverlay}
      >
        <View style={styles.cardInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.statsRow}>
            <Eye size={12} color="#FFF" />
            <Text style={styles.statsText}>{item.views}</Text>
          </View>
        </View>
      </LinearGradient>
      
      <TouchableOpacity 
        style={styles.deleteBtn}
        onPress={() => handleDelete(item.id)}
      >
        <Trash2 size={16} color="#FFF" />
      </TouchableOpacity>

      <View style={styles.typeBadge}>
        <Video size={12} color="#FFF" />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Plus size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.introBox}>
          <Text style={styles.introTitle}>Your Showcase</Text>
          <Text style={styles.introSubtitle}>
            Pinned work is the first thing brands see. Choose your best performing content.
          </Text>
        </View>

        <FlatList
          data={portfolio}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <LayoutGrid size={64} color="#E5E7EB" strokeWidth={1} />
              <Text style={styles.emptyTitle}>Your portfolio is empty</Text>
              <Text style={styles.emptySubtitle}>
                Add your best work or import a completed Modus project to start attracting brands.
              </Text>
              <TouchableOpacity style={styles.emptyAddBtn}>
                <Plus size={20} color="#FFF" />
                <Text style={styles.emptyAddBtnText}>Add First Item</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Persistence Tip */}
      <View style={styles.footer}>
        <LinearGradient
          colors={['#F3F4F6', '#FFF']}
          style={styles.tipBox}
        >
          <Text style={styles.tipText}>
            💡 <Text style={{ fontWeight: '800', color: '#000' }}>Pro Tip:</Text> High-resolution videos with clear lighting have a 40% higher conversion rate.
          </Text>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  introBox: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.8,
  },
  introSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  portfolioCard: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.5,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  cardInfo: {
    gap: 4,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    opacity: 0.8,
  },
  deleteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontWeight: '500',
    paddingHorizontal: 20,
  },
  emptyAddBtn: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  emptyAddBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  tipBox: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tipText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    fontWeight: '500',
  }
});
