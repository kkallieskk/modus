import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
  Dimensions,
  StyleSheet,
  RefreshControl,
  KeyboardAvoidingView,
  Animated,
  Platform,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { WebView } from 'react-native-webview';
import {
  Play, FolderOpen, X, CheckCircle2, Film, ArrowDownToLine, ExternalLink, User,
  FileVideo, ShieldCheck, Download, Calendar, HardDrive
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfile } from '@/lib/ProfileContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const TILE_SIZE = (SCREEN_WIDTH - 48) / COLUMN_COUNT;

type VaultAsset = {
  id: string;
  deliverable_url: string | null;
  status: string;
  campaigns: {
    title: string;
    budget: number;
  };
  profiles: {
    display_name: string;
  };
};

// ── Build a YouTube embed URL if applicable ───────────────────────────────────
const getYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const isDirectVideoUrl = (url: string): boolean => {
  const lower = url.toLowerCase().split('?')[0];
  return ['.mp4', '.mov', '.m4v', '.webm', '.avi', '.mkv'].some(ext => lower.endsWith(ext));
};

// ── Universal Video Player via WebView ────────────────────────────────────────
const UniversalVideoPlayer = ({ url }: { url: string }) => {
  const ytId = getYouTubeId(url);

  if (ytId) {
    // YouTube → iframe embed
    const html = `<!DOCTYPE html><html><head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>* {margin:0;padding:0} body {background:#000} iframe {width:100vw;height:100vh;border:none}</style>
    </head><body>
      <iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&playsinline=1"
        allow="autoplay; fullscreen" allowfullscreen></iframe>
    </body></html>`;
    return (
      <WebView
        source={{ html, baseUrl: 'https://www.youtube.com' }}
        style={{ width: '100%', height: SCREEN_HEIGHT * 0.45, backgroundColor: '#000' }}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        originWhitelist={['*']}
      />
    );
  }

  // Direct video file (.mp4, .mov, etc.) — load URI directly, no HTML wrapper
  // This avoids ALL CORS issues: the WebView loads it just like a browser opening a video URL
  if (isDirectVideoUrl(url)) {
    return (
      <WebView
        source={{ uri: url }}
        style={{ width: '100%', height: SCREEN_HEIGHT * 0.45, backgroundColor: '#000' }}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        javaScriptEnabled
      />
    );
  }

  // Fallback for any other URL (Vimeo, GDrive, etc.)
  return (
    <WebView
      source={{ uri: url }}
      style={{ width: '100%', height: SCREEN_HEIGHT * 0.45, backgroundColor: '#000' }}
      allowsFullscreenVideo
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      originWhitelist={['*']}
    />
  );
};




// ── Main Screen ───────────────────────────────────────────────────────────────
export const BrandVaultScreen = () => {
  const navigation = useNavigation<any>();
  const { profile } = useProfile();
  const [assets, setAssets] = useState<VaultAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<VaultAsset | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const brandColor = profile?.brand_color || '#8B5CF6';
  const softAuraTop = `${brandColor}2E`; // 0.18 opacity
  const softAuraBottom = `${brandColor}05`; // 0.02 opacity
  const badgeBg = `${brandColor}1A`; // 0.10 opacity


  useEffect(() => {
    fetchVaultAssets();
  }, []);

  const fetchVaultAssets = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('campaign_offers')
        .select(`
          id,
          deliverable_url,
          status,
          campaigns!inner(title, budget, brand_id),
          profiles!campaign_offers_creator_id_fkey(display_name)
        `)
        .eq('status', 'completed')
        .eq('campaigns.brand_id', user.id)
        .not('deliverable_url', 'is', null);

      if (error) throw error;
      setAssets((data as any) || []);
    } catch (err: any) {
      console.error('Vault fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVaultAssets();
  };

  // ─── DOWNLOAD ASSET ───────────────────────────────────────────────────────
  const handleDownload = async (asset: VaultAsset) => {
    if (!asset.deliverable_url) {
      Alert.alert('No Asset', 'This deliverable does not have a URL to download.');
      return;
    }

    try {
      // 1. Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Modus needs access to your media library to save videos. Please enable it in Settings.',
        );
        return;
      }

      setDownloading(true);
      setDownloaded(false);

      // 2. Download to local filesystem
      const fileExtension = asset.deliverable_url.split('.').pop()?.split('?')[0] || 'mp4';
      const fileName = `modus_${asset.id}.${fileExtension}`;
      const localUri = (FileSystem as any).documentDirectory + fileName;

      const { uri } = await FileSystem.downloadAsync(asset.deliverable_url, localUri);

      // 3. Save to camera roll / gallery
      await MediaLibrary.saveToLibraryAsync(uri);

      setDownloaded(true);
      Alert.alert('✅ Saved to Gallery!', `"${asset.campaigns?.title}" has been saved to your photo library.`);
    } catch (err: any) {
      console.error('Download error:', err);
      Alert.alert('Download Failed', err.message || 'Could not download the asset. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // ─── TILE ─────────────────────────────────────────────────────────────────
  const renderTile = ({ item }: { item: VaultAsset }) => (
    <TouchableOpacity
      onPress={() => { setSelectedAsset(item); setDownloaded(false); }}
      style={styles.tile}
      activeOpacity={0.9}
    >
      <View style={styles.tileBackground}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80' }} 
          style={styles.tileImage}
        />
        <View style={styles.tileOverlay}>
          <View style={styles.tileIcon}>
            <FileVideo size={16} color="white" />
          </View>
          <View style={styles.tileInfo}>
            <Text style={styles.tileTitle} numberOfLines={1}>{item.campaigns?.title}</Text>
            <Text style={styles.tileMetaText}>Final Asset • MP4</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ─── RENDER ───────────────────────────────────────────────────────────────
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      {/* Bespoke Gallery Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingTop: Math.max(insets.top, 20) + 12,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF'
      }}>
        <View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#000', letterSpacing: -0.5 }}>
            Content Vault
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <View style={{ backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, flexDirection: 'row', alignItems: 'center' }}>
              <FolderOpen size={14} color="#6B7280" />
              <Text style={{ color: '#6B7280', fontWeight: 'bold', fontSize: 12, marginLeft: 6 }}>
                {assets.length} Videos
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('BrandProfile')}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={{ width: 36, height: 36, borderRadius: 18 }} />
          ) : (
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}>
              <User size={20} color="#9CA3AF" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={brandColor} style={{ marginTop: 60 }} />
      ) : assets.length === 0 ? (
        <View style={styles.emptyState}>
          <Film size={52} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Vault is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Completed campaign videos will appear here once you approve a creator's deliverable.
          </Text>
        </View>
      ) : (
        <FlatList
          data={assets}
          keyExtractor={item => item.id}
          renderItem={renderTile}
          numColumns={COLUMN_COUNT}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
        />
      )}

      {/* ─── ASSET MODAL ──────────────────────────────────────────────────── */}
      <Modal
        visible={!!selectedAsset}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedAsset(null)}
      >
        {selectedAsset && (
          <View style={styles.modal}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setSelectedAsset(null)} style={styles.closeBtn}>
                  <X size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitle}>Asset Manager</Text>
                <View style={{ width: 44 }} />
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* High-Res Player */}
                <View style={styles.detailPlayerContainer}>
                  {selectedAsset.deliverable_url ? (
                    <UniversalVideoPlayer url={selectedAsset.deliverable_url} />
                  ) : (
                    <View style={styles.noVideoPlaceholder}>
                      <Film size={40} color="#6B7280" />
                      <Text style={{ color: '#6B7280', marginTop: 12 }}>Processing High-Res Asset...</Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalContentPadding}>
                  {/* Title & Creator */}
                  <View style={{ marginBottom: 24 }}>
                    <Text style={styles.modalCampaignTitle}>{selectedAsset.campaigns?.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Created by </Text>
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: '700' }}>{selectedAsset.profiles?.display_name}</Text>
                    </View>
                  </View>

                  {/* Massive Download Button */}
                  <TouchableOpacity
                    onPress={() => handleDownload(selectedAsset)}
                    disabled={downloading}
                    style={[
                      styles.massiveDownloadBtn,
                      { backgroundColor: brandColor },
                      downloaded && { backgroundColor: '#059669' }
                    ]}
                  >
                    {downloading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Download size={24} color="white" />
                        <Text style={styles.massiveDownloadBtnText}>
                          {downloaded ? 'Saved to Device' : 'Download High-Res Asset'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Usage Rights & License Section */}
                  <View style={styles.licenseSection}>
                    <View style={styles.licenseHeader}>
                      <ShieldCheck size={20} color={brandColor} />
                      <Text style={[styles.licenseHeaderTitle, { color: 'white' }]}>Usage Rights & License</Text>
                    </View>
                    <View style={styles.licenseGrid}>
                      <View style={styles.licenseItem}>
                        <HardDrive size={16} color="#4B5563" />
                        <View>
                          <Text style={styles.licenseLabel}>License Type</Text>
                          <Text style={styles.licenseValue}>Perpetual Organic Use</Text>
                        </View>
                      </View>
                      <View style={styles.licenseItem}>
                        <Calendar size={16} color="#4B5563" />
                        <View>
                          <Text style={styles.licenseLabel}>Exclusivity</Text>
                          <Text style={styles.licenseValue}>Non-Exclusive</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.licenseFooter}>
                      <Info size={14} color="#6B7280" />
                      <Text style={styles.licenseFooterText}>
                        This asset is approved for use on all brand social channels. For paid ad rights, please contact support.
                      </Text>
                    </View>
                  </View>

                  <View style={{ height: 40 }} />
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        )}
      </Modal>
    </View>
  );
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#374151', marginTop: 20 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  grid: { padding: 20, paddingBottom: 40 },
  gridRow: { gap: 16, marginBottom: 16 },
  tile: { flex: 1, height: 200, borderRadius: 24, overflow: 'hidden', backgroundColor: '#F3F4F6' },
  tileBackground: { flex: 1 },
  tileImage: { ...StyleSheet.absoluteFillObject, backgroundColor: '#111827' },
  tileOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)', padding: 16, justifyContent: 'space-between' },
  tileIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  tileInfo: { },
  tileTitle: { color: 'white', fontWeight: '800', fontSize: 13, marginBottom: 2 },
  tileMetaText: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600' },

  // Modal / Detail Screen
  modal: { flex: 1, backgroundColor: '#000' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, height: 56 },
  closeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  modalHeaderTitle: { color: 'white', fontSize: 16, fontWeight: '800' },
  detailPlayerContainer: { width: '100%', height: SCREEN_HEIGHT * 0.4, backgroundColor: '#111827' },
  modalContentPadding: { padding: 24 },
  modalCampaignTitle: { color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  massiveDownloadBtn: { height: 72, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32 },
  massiveDownloadBtnText: { color: 'white', fontWeight: '800', fontSize: 18 },
  
  licenseSection: { backgroundColor: '#111827', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1F2937' },
  licenseHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  licenseHeaderTitle: { fontSize: 16, fontWeight: '800' },
  licenseGrid: { gap: 16, marginBottom: 20 },
  licenseItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  licenseLabel: { color: '#6B7280', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  licenseValue: { color: '#E5E7EB', fontSize: 15, fontWeight: '700' },
  licenseFooter: { borderTopWidth: 1, borderTopColor: '#1F2937', paddingTop: 16, flexDirection: 'row', gap: 8 },
  licenseFooterText: { color: '#6B7280', fontSize: 12, flex: 1, lineHeight: 18 },
  
  noVideoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});



