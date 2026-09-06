import crypto from 'crypto';

export interface DailyRoomConfig {
  name: string;
  url: string;
  created_at?: number;
}

export interface DailyTokenConfig {
  token: string;
}

export class DailyService {
  private get apiKey(): string | undefined {
    return process.env.DAILY_API_KEY;
  }

  private get domain(): string {
    return process.env.DAILY_DOMAIN || 'curalink.daily.co';
  }

  async createRoom(appointmentId: string): Promise<DailyRoomConfig> {
    const roomName = `curalink-consult-${appointmentId.slice(0, 8)}-${crypto.randomBytes(4).toString('hex')}`;

    if (!this.apiKey) {
      console.log(`[DailyService] DAILY_API_KEY not configured. Generating dev room fallback: ${roomName}`);
      return {
        name: roomName,
        url: `https://${this.domain}/${roomName}`,
      };
    }

    try {
      const response = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          name: roomName,
          properties: {
            exp: Math.floor(Date.now() / 1000) + 7200, // 2 hours expiration
            enable_chat: true,
            enable_screenshare: true,
            eject_at_room_exp: true,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[DailyService] Room creation failed:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to create consultation room on Daily.co');
      }

      const data = await response.json();
      return {
        name: data.name,
        url: data.url,
      };
    } catch (error) {
      console.error('[DailyService] Error creating room:', error);
      // Return dev fallback room if Daily API request fails in dev environment
      if (process.env.NODE_ENV !== 'production') {
        return {
          name: roomName,
          url: `https://${this.domain}/${roomName}`,
        };
      }
      throw error;
    }
  }

  async createMeetingToken(
    roomName: string,
    userId: string,
    userName: string,
    isOwner: boolean
  ): Promise<DailyTokenConfig> {
    if (!this.apiKey) {
      console.log(`[DailyService] DAILY_API_KEY not configured. Generating dev meeting token for user: ${userId}`);
      return {
        token: `dev_token_${userId}_${Date.now()}`,
      };
    }

    try {
      const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          properties: {
            room_name: roomName,
            user_name: userName,
            user_id: userId,
            is_owner: isOwner,
            exp: Math.floor(Date.now() / 1000) + 7200, // 2 hours expiration
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[DailyService] Token creation failed:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to create meeting token on Daily.co');
      }

      const data = await response.json();
      return {
        token: data.token,
      };
    } catch (error) {
      console.error('[DailyService] Error creating meeting token:', error);
      if (process.env.NODE_ENV !== 'production') {
        return {
          token: `dev_token_${userId}_${Date.now()}`,
        };
      }
      throw error;
    }
  }
}

export const dailyService = new DailyService();
