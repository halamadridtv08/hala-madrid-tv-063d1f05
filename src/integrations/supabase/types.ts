export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string | null
          coach_id: string | null
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
          year: string
        }
        Insert: {
          category?: string | null
          coach_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          year: string
        }
        Update: {
          category?: string | null
          coach_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string | null
          id: string
          requires_2fa: boolean | null
        }
        Insert: {
          created_at?: string | null
          id: string
          requires_2fa?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          requires_2fa?: boolean | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_id: string
          category: string
          content: string
          description: string
          featured: boolean | null
          id: string
          image_url: string | null
          is_published: boolean | null
          published_at: string | null
          read_time: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          category: string
          content: string
          description: string
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          description?: string
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coaches: {
        Row: {
          age: number | null
          bio: string | null
          biography: string | null
          created_at: string
          experience_years: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          nationality: string | null
          profile_image_url: string | null
          role: string
          social_media: Json | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          bio?: string | null
          biography?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          nationality?: string | null
          profile_image_url?: string | null
          role: string
          social_media?: Json | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          bio?: string | null
          biography?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          nationality?: string | null
          profile_image_url?: string | null
          role?: string
          social_media?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempted_at: string
          email: string
          id: string
          ip_address: string | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          away_score: number | null
          away_team: string
          away_team_logo: string | null
          competition: string | null
          created_at: string
          home_score: number | null
          home_team: string
          home_team_logo: string | null
          id: string
          match_date: string
          match_details: Json | null
          status: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          away_score?: number | null
          away_team: string
          away_team_logo?: string | null
          competition?: string | null
          created_at?: string
          home_score?: number | null
          home_team: string
          home_team_logo?: string | null
          id?: string
          match_date: string
          match_details?: Json | null
          status?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          away_score?: number | null
          away_team?: string
          away_team_logo?: string | null
          competition?: string | null
          created_at?: string
          home_score?: number | null
          home_team?: string
          home_team_logo?: string | null
          id?: string
          match_date?: string
          match_details?: Json | null
          status?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      media_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          media_type: string
          media_url: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          media_type: string
          media_url: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          media_type?: string
          media_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_published: boolean | null
          photographer: string | null
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_published?: boolean | null
          photographer?: string | null
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_published?: boolean | null
          photographer?: string | null
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          assists: number | null
          clean_sheets: number | null
          created_at: string
          goals: number | null
          goals_conceded: number | null
          id: string
          interceptions: number | null
          match_id: string | null
          minutes_played: number | null
          pass_accuracy: number | null
          passes_completed: number | null
          player_id: string
          red_cards: number | null
          saves: number | null
          tackles: number | null
          updated_at: string
          yellow_cards: number | null
        }
        Insert: {
          assists?: number | null
          clean_sheets?: number | null
          created_at?: string
          goals?: number | null
          goals_conceded?: number | null
          id?: string
          interceptions?: number | null
          match_id?: string | null
          minutes_played?: number | null
          pass_accuracy?: number | null
          passes_completed?: number | null
          player_id: string
          red_cards?: number | null
          saves?: number | null
          tackles?: number | null
          updated_at?: string
          yellow_cards?: number | null
        }
        Update: {
          assists?: number | null
          clean_sheets?: number | null
          created_at?: string
          goals?: number | null
          goals_conceded?: number | null
          id?: string
          interceptions?: number | null
          match_id?: string | null
          minutes_played?: number | null
          pass_accuracy?: number | null
          passes_completed?: number | null
          player_id?: string
          red_cards?: number | null
          saves?: number | null
          tackles?: number | null
          updated_at?: string
          yellow_cards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          age: number | null
          bio: string | null
          biography: string | null
          created_at: string
          "Date de naissance": string | null
          display_order: number | null
          height: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          jersey_number: number | null
          name: string
          nationality: string | null
          position: string
          position_group_order: number | null
          profile_image_url: string | null
          social_media: Json | null
          stats: Json | null
          updated_at: string
          weight: string | null
        }
        Insert: {
          age?: number | null
          bio?: string | null
          biography?: string | null
          created_at?: string
          "Date de naissance"?: string | null
          display_order?: number | null
          height?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          jersey_number?: number | null
          name: string
          nationality?: string | null
          position: string
          position_group_order?: number | null
          profile_image_url?: string | null
          social_media?: Json | null
          stats?: Json | null
          updated_at?: string
          weight?: string | null
        }
        Update: {
          age?: number | null
          bio?: string | null
          biography?: string | null
          created_at?: string
          "Date de naissance"?: string | null
          display_order?: number | null
          height?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          jersey_number?: number | null
          name?: string
          nationality?: string | null
          position?: string
          position_group_order?: number | null
          profile_image_url?: string | null
          social_media?: Json | null
          stats?: Json | null
          updated_at?: string
          weight?: string | null
        }
        Relationships: []
      }
      press_conferences: {
        Row: {
          category: string | null
          conference_date: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          is_published: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          conference_date: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_published?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          conference_date?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_published?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          is_published: boolean | null
          thumbnail_url: string | null
          title: string
          training_date: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_published?: boolean | null
          thumbnail_url?: string | null
          title: string
          training_date: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_published?: boolean | null
          thumbnail_url?: string | null
          title?: string
          training_date?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      user_totp_secrets: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          id: string
          is_verified: boolean | null
          secret: string
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          secret: string
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          secret?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration: number | null
          id: string
          is_published: boolean | null
          published_at: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_all_players_ages: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
