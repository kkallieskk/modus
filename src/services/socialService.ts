import { supabase } from '../lib/supabase';

export interface SocialAccountData {
  platform: 'tiktok' | 'instagram' | 'youtube';
  username: string;
  displayName: string;
  followerCount: number;
  profilePictureUrl: string;
  platformUserId: string;
}

export const socialService = {
  /**
   * Simulates the OAuth handshake with a social platform.
   * In a real app, this would open a browser window and handle the redirect.
   */
  async connectAccount(platform: 'tiktok' | 'instagram' | 'youtube'): Promise<SocialAccountData> {
    console.log(`[SocialService] Starting OAuth handshake for ${platform}...`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mocked data based on the platform
    const mockData: Record<string, SocialAccountData> = {
      instagram: {
        platform: 'instagram',
        username: 'creators_vibe',
        displayName: 'Creative Soul',
        followerCount: 45200,
        profilePictureUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=200&auto=format&fit=crop',
        platformUserId: 'ig_99228811'
      },
      tiktok: {
        platform: 'tiktok',
        username: '@creator_daily',
        displayName: 'Daily Lifestyle',
        followerCount: 128500,
        profilePictureUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=200&auto=format&fit=crop',
        platformUserId: 'tt_11223344'
      },
      youtube: {
        platform: 'youtube',
        username: 'ModernCreative',
        displayName: 'The Modern Creative',
        followerCount: 250000,
        profilePictureUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=200&auto=format&fit=crop',
        platformUserId: 'yt_88776655'
      }
    };

    return mockData[platform];
  },

  /**
   * Saves or updates a social account in the database.
   */
  async saveAccount(creatorId: string, data: SocialAccountData) {
    const { error } = await supabase
      .from('social_accounts')
      .upsert({
        creator_id: creatorId,
        platform: data.platform,
        platform_user_id: data.platformUserId,
        username: data.username,
        display_name: data.displayName,
        profile_picture_url: data.profilePictureUrl,
        follower_count: data.followerCount,
        last_synced_at: new Date().toISOString()
      }, { onConflict: 'platform, platform_user_id' });

    if (error) throw error;
    
    // Log history for growth tracking
    await this.logMetricHistory(creatorId, data.platform, data.followerCount);
  },

  /**
   * Logs a snapshot of the follower count for historical tracking.
   */
  async logMetricHistory(creatorId: string, platform: string, count: number) {
    // First find the account ID
    const { data: account } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('creator_id', creatorId)
      .eq('platform', platform)
      .single();

    if (account) {
      await supabase
        .from('social_metrics_history')
        .insert({
          social_account_id: account.id,
          follower_count: count
        });
    }
  },

  /**
   * Fetches all linked social accounts for a creator.
   */
  async getLinkedAccounts(creatorId: string) {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('creator_id', creatorId);

    if (error) throw error;
    return data;
  }
};
