export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
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
      article_images: {
        Row: {
          article_id: string
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          updated_at: string
        }
        Insert: {
          article_id: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_images_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
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
          video_url: string | null
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
          video_url?: string | null
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
          video_url?: string | null
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
      flash_news: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          author: string
          author_handle: string
          category: string
          content: string
          created_at: string | null
          id: string
          is_published: boolean | null
          scheduled_at: string | null
          status: string | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          author: string
          author_handle: string
          category: string
          content: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          author?: string
          author_handle?: string
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      flash_news_categories: {
        Row: {
          color: string
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      flash_news_sources: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          handle: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          handle: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          handle?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      flash_news_versions: {
        Row: {
          author: string
          author_handle: string
          category: string
          change_description: string | null
          content: string
          created_at: string | null
          flash_news_id: string
          id: string
          modified_by: string | null
          modified_by_email: string | null
          scheduled_at: string | null
          status: string | null
          verified: boolean | null
          version_number: number
        }
        Insert: {
          author: string
          author_handle: string
          category: string
          change_description?: string | null
          content: string
          created_at?: string | null
          flash_news_id: string
          id?: string
          modified_by?: string | null
          modified_by_email?: string | null
          scheduled_at?: string | null
          status?: string | null
          verified?: boolean | null
          version_number?: number
        }
        Update: {
          author?: string
          author_handle?: string
          category?: string
          change_description?: string | null
          content?: string
          created_at?: string | null
          flash_news_id?: string
          id?: string
          modified_by?: string | null
          modified_by_email?: string | null
          scheduled_at?: string | null
          status?: string | null
          verified?: boolean | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "flash_news_versions_flash_news_id_fkey"
            columns: ["flash_news_id"]
            isOneToOne: false
            referencedRelation: "flash_news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flash_news_versions_flash_news_id_fkey"
            columns: ["flash_news_id"]
            isOneToOne: false
            referencedRelation: "published_flash_news"
            referencedColumns: ["id"]
          },
        ]
      }
      kit_images: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          kit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          kit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          kit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kit_images_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
        ]
      }
      kits: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          price: number | null
          season: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          price?: number | null
          season?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          price?: number | null
          season?: string
          title?: string
          type?: string
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
      match_absent_players: {
        Row: {
          created_at: string | null
          id: string
          match_id: string
          opposing_player_id: string | null
          player_id: string | null
          player_name: string
          reason: string
          return_date: string | null
          team_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id: string
          opposing_player_id?: string | null
          player_id?: string | null
          player_name: string
          reason: string
          return_date?: string | null
          team_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string
          opposing_player_id?: string | null
          player_id?: string | null
          player_name?: string
          reason?: string
          return_date?: string | null
          team_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_absent_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_absent_players_opposing_player_id_fkey"
            columns: ["opposing_player_id"]
            isOneToOne: false
            referencedRelation: "opposing_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_absent_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      match_formation_players: {
        Row: {
          created_at: string
          formation_id: string
          id: string
          is_starter: boolean
          jersey_number: number | null
          opposing_player_id: string | null
          player_id: string | null
          player_image_url: string | null
          player_name: string
          player_position: string
          player_rating: number | null
          position_x: number
          position_y: number
          substitution_minute: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          formation_id: string
          id?: string
          is_starter?: boolean
          jersey_number?: number | null
          opposing_player_id?: string | null
          player_id?: string | null
          player_image_url?: string | null
          player_name: string
          player_position: string
          player_rating?: number | null
          position_x?: number
          position_y?: number
          substitution_minute?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          formation_id?: string
          id?: string
          is_starter?: boolean
          jersey_number?: number | null
          opposing_player_id?: string | null
          player_id?: string | null
          player_image_url?: string | null
          player_name?: string
          player_position?: string
          player_rating?: number | null
          position_x?: number
          position_y?: number
          substitution_minute?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_formation_players_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "match_formations"
            referencedColumns: ["id"]
          },
        ]
      }
      match_formations: {
        Row: {
          created_at: string
          formation: string
          id: string
          match_id: string
          team_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          formation?: string
          id?: string
          match_id: string
          team_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          formation?: string
          id?: string
          match_id?: string
          team_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      match_import_history: {
        Row: {
          created_at: string
          id: string
          imported_at: string
          imported_by: string
          json_data: Json
          match_id: string
          players_updated: number | null
          previous_match_data: Json
          previous_stats_data: Json | null
          stats_summary: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          imported_at?: string
          imported_by: string
          json_data: Json
          match_id: string
          players_updated?: number | null
          previous_match_data: Json
          previous_stats_data?: Json | null
          stats_summary?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          imported_at?: string
          imported_by?: string
          json_data?: Json
          match_id?: string
          players_updated?: number | null
          previous_match_data?: Json
          previous_stats_data?: Json | null
          stats_summary?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "match_import_history_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_lineups: {
        Row: {
          created_at: string
          id: string
          match_id: string
          opposing_team_formation: string | null
          opposing_team_id: string
          real_madrid_formation: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          opposing_team_formation?: string | null
          opposing_team_id: string
          real_madrid_formation?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          opposing_team_formation?: string | null
          opposing_team_id?: string
          real_madrid_formation?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_lineups_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_lineups_opposing_team_id_fkey"
            columns: ["opposing_team_id"]
            isOneToOne: false
            referencedRelation: "opposing_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_probable_lineups: {
        Row: {
          created_at: string | null
          id: string
          is_starter: boolean | null
          jersey_number: number | null
          match_id: string
          opposing_player_id: string | null
          player_id: string | null
          player_name: string
          position: string
          team_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_starter?: boolean | null
          jersey_number?: number | null
          match_id: string
          opposing_player_id?: string | null
          player_id?: string | null
          player_name: string
          position: string
          team_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_starter?: boolean | null
          jersey_number?: number | null
          match_id?: string
          opposing_player_id?: string | null
          player_id?: string | null
          player_name?: string
          position?: string
          team_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_probable_lineups_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_probable_lineups_opposing_player_id_fkey"
            columns: ["opposing_player_id"]
            isOneToOne: false
            referencedRelation: "opposing_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_probable_lineups_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
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
          opposing_team_id: string | null
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
          opposing_team_id?: string | null
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
          opposing_team_id?: string | null
          status?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_opposing_team_id_fkey"
            columns: ["opposing_team_id"]
            isOneToOne: false
            referencedRelation: "opposing_teams"
            referencedColumns: ["id"]
          },
        ]
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
      opposing_players: {
        Row: {
          created_at: string
          id: string
          is_starter: boolean | null
          jersey_number: number | null
          name: string
          position: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_starter?: boolean | null
          jersey_number?: number | null
          name: string
          position: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_starter?: boolean | null
          jersey_number?: number | null
          name?: string
          position?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opposing_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "opposing_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      opposing_teams: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
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
      player_alert_thresholds: {
        Row: {
          alert_message: string
          created_at: string
          id: string
          is_active: boolean | null
          stat_type: string
          threshold_value: number
          updated_at: string
        }
        Insert: {
          alert_message: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          stat_type: string
          threshold_value: number
          updated_at?: string
        }
        Update: {
          alert_message?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          stat_type?: string
          threshold_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      player_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_message: string
          current_value: number
          id: string
          is_acknowledged: boolean | null
          player_id: string
          stat_type: string
          threshold_value: number
          triggered_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_message: string
          current_value: number
          id?: string
          is_acknowledged?: boolean | null
          player_id: string
          stat_type: string
          threshold_value: number
          triggered_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_message?: string
          current_value?: number
          id?: string
          is_acknowledged?: boolean | null
          player_id?: string
          stat_type?: string
          threshold_value?: number
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_alerts_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
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
          is_featured: boolean | null
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
          is_featured?: boolean | null
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
          is_featured?: boolean | null
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
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
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
      user_role_history: {
        Row: {
          changed_by: string
          changed_by_email: string | null
          created_at: string
          id: string
          new_role: Database["public"]["Enums"]["app_role"]
          old_role: Database["public"]["Enums"]["app_role"] | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_by: string
          changed_by_email?: string | null
          created_at?: string
          id?: string
          new_role: Database["public"]["Enums"]["app_role"]
          old_role?: Database["public"]["Enums"]["app_role"] | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_by?: string
          changed_by_email?: string | null
          created_at?: string
          id?: string
          new_role?: Database["public"]["Enums"]["app_role"]
          old_role?: Database["public"]["Enums"]["app_role"] | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      youtube_videos: {
        Row: {
          created_at: string
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          thumbnail_url: string
          title: string
          updated_at: string
          youtube_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          thumbnail_url: string
          title: string
          updated_at?: string
          youtube_url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          thumbnail_url?: string
          title?: string
          updated_at?: string
          youtube_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      published_flash_news: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          author: string | null
          author_handle: string | null
          category: string | null
          content: string | null
          created_at: string | null
          id: string | null
          is_published: boolean | null
          scheduled_at: string | null
          status: string | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          author?: string | null
          author_handle?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_published?: boolean | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          author?: string | null
          author_handle?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_published?: boolean | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_player_stats_alerts: { Args: never; Returns: undefined }
      get_role_history: {
        Args: { p_user_id?: string }
        Returns: {
          changed_by: string
          changed_by_email: string
          created_at: string
          id: string
          new_role: Database["public"]["Enums"]["app_role"]
          old_role: Database["public"]["Enums"]["app_role"]
          reason: string
          user_email: string
          user_id: string
        }[]
      }
      get_users_with_roles: {
        Args: never
        Returns: {
          created_at: string
          email: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      publish_scheduled_flash_news: { Args: never; Returns: undefined }
      update_all_players_ages: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator"
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
    Enums: {
      app_role: ["admin", "user", "moderator"],
    },
  },
} as const
