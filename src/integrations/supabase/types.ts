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
    PostgrestVersion: "13.0.5"
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
      admin_audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
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
      announcement_bar: {
        Row: {
          background_color: string | null
          created_at: string
          cta_link: string | null
          cta_text: string | null
          emoji: string | null
          id: string
          is_active: boolean | null
          message: string
          text_color: string | null
          updated_at: string
        }
        Insert: {
          background_color?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          text_color?: string | null
          updated_at?: string
        }
        Update: {
          background_color?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          text_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      article_ads: {
        Row: {
          aspect_ratio: string | null
          click_count: number | null
          created_at: string
          custom_height: number | null
          custom_width: number | null
          display_order: number | null
          end_date: string | null
          id: string
          image_url: string
          impression_count: number | null
          is_active: boolean | null
          link_url: string | null
          position: string | null
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          aspect_ratio?: string | null
          click_count?: number | null
          created_at?: string
          custom_height?: number | null
          custom_width?: number | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url: string
          impression_count?: number | null
          is_active?: boolean | null
          link_url?: string | null
          position?: string | null
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          aspect_ratio?: string | null
          click_count?: number | null
          created_at?: string
          custom_height?: number | null
          custom_width?: number | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url?: string
          impression_count?: number | null
          is_active?: boolean | null
          link_url?: string | null
          position?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      article_comments: {
        Row: {
          article_id: string
          content: string
          created_at: string | null
          id: string
          is_approved: boolean | null
          is_published: boolean | null
          updated_at: string | null
          user_email: string | null
          user_name: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_published?: boolean | null
          updated_at?: string | null
          user_email?: string | null
          user_name: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_published?: boolean | null
          updated_at?: string | null
          user_email?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
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
      article_polls: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          question: string
          updated_at: string | null
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          updated_at?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_polls_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_quizzes: {
        Row: {
          article_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          article_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_quizzes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_tweets: {
        Row: {
          article_id: string
          created_at: string | null
          display_order: number | null
          id: string
          is_published: boolean | null
          tweet_html: string | null
          tweet_url: string
          updated_at: string | null
        }
        Insert: {
          article_id: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          tweet_html?: string | null
          tweet_url: string
          updated_at?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          tweet_html?: string | null
          tweet_url?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_tweets_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_view_history: {
        Row: {
          article_id: string
          created_at: string
          id: string
          user_id: string | null
          visitor_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          user_id?: string | null
          visitor_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          user_id?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_view_history_article_id_fkey"
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
          author_name: string | null
          category: string
          content: string
          description: string
          featured: boolean | null
          id: string
          image_url: string | null
          is_published: boolean | null
          published_at: string | null
          read_time: string | null
          scheduled_at: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          author_id: string
          author_name?: string | null
          category: string
          content: string
          description: string
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          scheduled_at?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string
          author_name?: string | null
          category?: string
          content?: string
          description?: string
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          scheduled_at?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      blocked_email_domains: {
        Row: {
          created_at: string
          domain: string
          id: string
          is_active: boolean | null
          reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          is_active?: boolean | null
          reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          is_active?: boolean | null
          reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      branding_settings: {
        Row: {
          accent_color: string | null
          created_at: string
          favicon_url: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          site_name: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          site_name?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          site_name?: string | null
          updated_at?: string
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
      competition_aliases: {
        Row: {
          aliases: string[]
          canonical_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          aliases?: string[]
          canonical_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          aliases?: string[]
          canonical_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dream_teams: {
        Row: {
          created_at: string
          formation: string
          id: string
          likes_count: number | null
          players: Json
          share_token: string | null
          team_name: string
          total_budget_used: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          formation?: string
          id?: string
          likes_count?: number | null
          players?: Json
          share_token?: string | null
          team_name?: string
          total_budget_used?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          formation?: string
          id?: string
          likes_count?: number | null
          players?: Json
          share_token?: string | null
          team_name?: string
          total_budget_used?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      explore_cards: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
          url?: string
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
      footer_links: {
        Row: {
          content: string | null
          created_at: string
          display_order: number | null
          icon: string | null
          id: string
          is_visible: boolean | null
          link_type: string
          section: string
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          link_type?: string
          section?: string
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          link_type?: string
          section?: string
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      formation_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          formation: string
          id: string
          is_default: boolean | null
          name: string
          positions: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          formation: string
          id?: string
          is_default?: boolean | null
          name: string
          positions: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          formation?: string
          id?: string
          is_default?: boolean | null
          name?: string
          positions?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          category: string
          config: Json | null
          created_at: string
          description: string | null
          documentation_url: string | null
          icon: string
          id: string
          integration_key: string
          is_enabled: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          config?: Json | null
          created_at?: string
          description?: string | null
          documentation_url?: string | null
          icon: string
          id?: string
          integration_key: string
          is_enabled?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          config?: Json | null
          created_at?: string
          description?: string | null
          documentation_url?: string | null
          icon?: string
          id?: string
          integration_key?: string
          is_enabled?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
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
      live_blog_entries: {
        Row: {
          assist_player_id: string | null
          author_id: string | null
          card_reason: string | null
          card_type: string | null
          content: string
          created_at: string
          entry_type: string
          id: string
          image_url: string | null
          is_important: boolean | null
          match_id: string
          minute: number | null
          player_id: string | null
          substituted_player_id: string | null
          team_side: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          assist_player_id?: string | null
          author_id?: string | null
          card_reason?: string | null
          card_type?: string | null
          content: string
          created_at?: string
          entry_type?: string
          id?: string
          image_url?: string | null
          is_important?: boolean | null
          match_id: string
          minute?: number | null
          player_id?: string | null
          substituted_player_id?: string | null
          team_side?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          assist_player_id?: string | null
          author_id?: string | null
          card_reason?: string | null
          card_type?: string | null
          content?: string
          created_at?: string
          entry_type?: string
          id?: string
          image_url?: string | null
          is_important?: boolean | null
          match_id?: string
          minute?: number | null
          player_id?: string | null
          substituted_player_id?: string | null
          team_side?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_blog_entries_assist_player_id_fkey"
            columns: ["assist_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_blog_entries_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_blog_entries_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_blog_entries_substituted_player_id_fkey"
            columns: ["substituted_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      live_match_bar_settings: {
        Row: {
          active_match_id: string | null
          background_image_url: string | null
          created_at: string | null
          custom_cta_link: string | null
          custom_cta_text: string | null
          custom_message: string | null
          id: string
          is_forced_active: boolean | null
          promo_image_url: string | null
          promo_link: string | null
          show_scores: boolean | null
          show_timer: boolean | null
          theme_color: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          active_match_id?: string | null
          background_image_url?: string | null
          created_at?: string | null
          custom_cta_link?: string | null
          custom_cta_text?: string | null
          custom_message?: string | null
          id?: string
          is_forced_active?: boolean | null
          promo_image_url?: string | null
          promo_link?: string | null
          show_scores?: boolean | null
          show_timer?: boolean | null
          theme_color?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          active_match_id?: string | null
          background_image_url?: string | null
          created_at?: string | null
          custom_cta_link?: string | null
          custom_cta_text?: string | null
          custom_message?: string | null
          id?: string
          is_forced_active?: boolean | null
          promo_image_url?: string | null
          promo_link?: string | null
          show_scores?: boolean | null
          show_timer?: boolean | null
          theme_color?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_match_bar_settings_active_match_id_fkey"
            columns: ["active_match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempted_at: string
          country: string | null
          device_fingerprint: string | null
          email: string
          failed_reason: string | null
          id: string
          ip_address: string | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string
          country?: string | null
          device_fingerprint?: string | null
          email: string
          failed_reason?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string
          country?: string | null
          device_fingerprint?: string | null
          email?: string
          failed_reason?: string | null
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
      match_predictions: {
        Row: {
          away_score_prediction: number
          created_at: string | null
          home_score_prediction: number
          id: string
          match_id: string
          points_earned: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          away_score_prediction?: number
          created_at?: string | null
          home_score_prediction?: number
          id?: string
          match_id: string
          points_earned?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          away_score_prediction?: number
          created_at?: string | null
          home_score_prediction?: number
          id?: string
          match_id?: string
          points_earned?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
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
      match_timer_settings: {
        Row: {
          created_at: string | null
          current_half: number | null
          first_half_extra_time: number | null
          half_started_at: string | null
          id: string
          is_extra_time: boolean | null
          is_paused: boolean | null
          is_timer_running: boolean | null
          match_id: string | null
          paused_at_minute: number | null
          second_half_extra_time: number | null
          timer_started_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_half?: number | null
          first_half_extra_time?: number | null
          half_started_at?: string | null
          id?: string
          is_extra_time?: boolean | null
          is_paused?: boolean | null
          is_timer_running?: boolean | null
          match_id?: string | null
          paused_at_minute?: number | null
          second_half_extra_time?: number | null
          timer_started_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_half?: number | null
          first_half_extra_time?: number | null
          half_started_at?: string | null
          id?: string
          is_extra_time?: boolean | null
          is_paused?: boolean | null
          is_timer_running?: boolean | null
          match_id?: string | null
          paused_at_minute?: number | null
          second_half_extra_time?: number | null
          timer_started_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_timer_settings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
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
      moderator_actions: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_title: string | null
          entity_type: string
          id: string
          moderator_id: string
          notification_sent: boolean | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_title?: string | null
          entity_type: string
          id?: string
          moderator_id: string
          notification_sent?: boolean | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_title?: string | null
          entity_type?: string
          id?: string
          moderator_id?: string
          notification_sent?: boolean | null
        }
        Relationships: []
      }
      navigation_links: {
        Row: {
          created_at: string
          display_order: number | null
          icon: string | null
          id: string
          is_visible: boolean | null
          label: string
          location: string | null
          parent_id: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          label: string
          location?: string | null
          parent_id?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          label?: string
          location?: string | null
          parent_id?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "navigation_links_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_links"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          confirmation_token: string | null
          confirmed_at: string | null
          email: string
          id: string
          is_active: boolean | null
          is_confirmed: boolean | null
          name: string | null
          subscribed_at: string
          subscription_type: string
          unsubscribed_at: string | null
        }
        Insert: {
          confirmation_token?: string | null
          confirmed_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          is_confirmed?: boolean | null
          name?: string | null
          subscribed_at?: string
          subscription_type?: string
          unsubscribed_at?: string | null
        }
        Update: {
          confirmation_token?: string | null
          confirmed_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_confirmed?: boolean | null
          name?: string | null
          subscribed_at?: string
          subscription_type?: string
          unsubscribed_at?: string | null
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
          photo_url: string | null
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
          photo_url?: string | null
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
          photo_url?: string | null
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
      page_views: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          visitor_id: string
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          visitor_id: string
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string
          name: string
          tier: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url: string
          name: string
          tier?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string
          name?: string
          tier?: string
          updated_at?: string
          website_url?: string | null
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
      player_objectives: {
        Row: {
          achieved_at: string | null
          competition: string | null
          created_at: string
          created_by: string | null
          current_value: number | null
          deadline: string | null
          description: string | null
          id: string
          is_achieved: boolean | null
          objective_type: string
          player_id: string
          season: string
          target_value: number
          updated_at: string
        }
        Insert: {
          achieved_at?: string | null
          competition?: string | null
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          is_achieved?: boolean | null
          objective_type: string
          player_id: string
          season: string
          target_value: number
          updated_at?: string
        }
        Update: {
          achieved_at?: string | null
          competition?: string | null
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          is_achieved?: boolean | null
          objective_type?: string
          player_id?: string
          season?: string
          target_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_objectives_player_id_fkey"
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
          market_value: number | null
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
          market_value?: number | null
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
          market_value?: number | null
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
      poll_options: {
        Row: {
          created_at: string | null
          id: string
          option_text: string
          poll_id: string
          vote_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_text: string
          poll_id: string
          vote_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_text?: string
          poll_id?: string
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "article_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_id: string
          poll_id: string
          user_identifier: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id: string
          poll_id: string
          user_identifier: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string
          poll_id?: string
          user_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "article_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_leaderboard: {
        Row: {
          best_streak: number | null
          correct_outcomes: number | null
          correct_scores: number | null
          created_at: string | null
          current_streak: number | null
          id: string
          total_points: number | null
          total_predictions: number | null
          updated_at: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          best_streak?: number | null
          correct_outcomes?: number | null
          correct_scores?: number | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          total_points?: number | null
          total_predictions?: number | null
          updated_at?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          best_streak?: number | null
          correct_outcomes?: number | null
          correct_scores?: number | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          total_points?: number | null
          total_predictions?: number | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string
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
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          display_order: number | null
          id: string
          question: string
          quiz_id: string
          wrong_answers: string[]
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          question: string
          quiz_id: string
          wrong_answers: string[]
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          question?: string
          quiz_id?: string
          wrong_answers?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "article_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: string
          attempts: number | null
          blocked_until: string | null
          first_attempt_at: string | null
          id: string
          identifier: string
          last_attempt_at: string | null
        }
        Insert: {
          action: string
          attempts?: number | null
          blocked_until?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier: string
          last_attempt_at?: string | null
        }
        Update: {
          action?: string
          attempts?: number | null
          blocked_until?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier?: string
          last_attempt_at?: string | null
        }
        Relationships: []
      }
      season_live_blog_archive: {
        Row: {
          archived_at: string | null
          content: string | null
          entry_type: string | null
          id: string
          image_url: string | null
          is_important: boolean | null
          match_id: string | null
          minute: number | null
          original_id: string | null
          player_id: string | null
          season: string
          team_side: string | null
          title: string | null
        }
        Insert: {
          archived_at?: string | null
          content?: string | null
          entry_type?: string | null
          id?: string
          image_url?: string | null
          is_important?: boolean | null
          match_id?: string | null
          minute?: number | null
          original_id?: string | null
          player_id?: string | null
          season: string
          team_side?: string | null
          title?: string | null
        }
        Update: {
          archived_at?: string | null
          content?: string | null
          entry_type?: string | null
          id?: string
          image_url?: string | null
          is_important?: boolean | null
          match_id?: string | null
          minute?: number | null
          original_id?: string | null
          player_id?: string | null
          season?: string
          team_side?: string | null
          title?: string | null
        }
        Relationships: []
      }
      season_matches_archive: {
        Row: {
          archived_at: string | null
          away_score: number | null
          away_team: string | null
          away_team_logo: string | null
          competition: string | null
          home_score: number | null
          home_team: string | null
          home_team_logo: string | null
          id: string
          match_date: string | null
          match_details: Json | null
          original_id: string | null
          season: string
          status: string | null
          venue: string | null
        }
        Insert: {
          archived_at?: string | null
          away_score?: number | null
          away_team?: string | null
          away_team_logo?: string | null
          competition?: string | null
          home_score?: number | null
          home_team?: string | null
          home_team_logo?: string | null
          id?: string
          match_date?: string | null
          match_details?: Json | null
          original_id?: string | null
          season: string
          status?: string | null
          venue?: string | null
        }
        Update: {
          archived_at?: string | null
          away_score?: number | null
          away_team?: string | null
          away_team_logo?: string | null
          competition?: string | null
          home_score?: number | null
          home_team?: string | null
          home_team_logo?: string | null
          id?: string
          match_date?: string | null
          match_details?: Json | null
          original_id?: string | null
          season?: string
          status?: string | null
          venue?: string | null
        }
        Relationships: []
      }
      season_player_stats_archive: {
        Row: {
          archived_at: string | null
          assists: number | null
          clean_sheets: number | null
          goals: number | null
          goals_conceded: number | null
          id: string
          interceptions: number | null
          match_id: string | null
          minutes_played: number | null
          original_id: string | null
          pass_accuracy: number | null
          passes_completed: number | null
          player_id: string | null
          rating: number | null
          red_cards: number | null
          saves: number | null
          season: string
          tackles: number | null
          yellow_cards: number | null
        }
        Insert: {
          archived_at?: string | null
          assists?: number | null
          clean_sheets?: number | null
          goals?: number | null
          goals_conceded?: number | null
          id?: string
          interceptions?: number | null
          match_id?: string | null
          minutes_played?: number | null
          original_id?: string | null
          pass_accuracy?: number | null
          passes_completed?: number | null
          player_id?: string | null
          rating?: number | null
          red_cards?: number | null
          saves?: number | null
          season: string
          tackles?: number | null
          yellow_cards?: number | null
        }
        Update: {
          archived_at?: string | null
          assists?: number | null
          clean_sheets?: number | null
          goals?: number | null
          goals_conceded?: number | null
          id?: string
          interceptions?: number | null
          match_id?: string | null
          minutes_played?: number | null
          original_id?: string | null
          pass_accuracy?: number | null
          passes_completed?: number | null
          player_id?: string | null
          rating?: number | null
          red_cards?: number | null
          saves?: number | null
          season?: string
          tackles?: number | null
          yellow_cards?: number | null
        }
        Relationships: []
      }
      season_predictions_archive: {
        Row: {
          archived_at: string | null
          best_streak: number | null
          correct_outcomes: number | null
          correct_scores: number | null
          current_streak: number | null
          id: string
          season: string
          total_points: number | null
          total_predictions: number | null
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          best_streak?: number | null
          correct_outcomes?: number | null
          correct_scores?: number | null
          current_streak?: number | null
          id?: string
          season: string
          total_points?: number | null
          total_predictions?: number | null
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          best_streak?: number | null
          correct_outcomes?: number | null
          correct_scores?: number | null
          current_streak?: number | null
          id?: string
          season?: string
          total_points?: number | null
          total_predictions?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      season_statistics: {
        Row: {
          clean_sheets: number | null
          competition: string | null
          created_at: string
          goals_conceded: number | null
          goals_scored: number | null
          id: string
          matches_drawn: number | null
          matches_lost: number | null
          matches_won: number | null
          season: string
          top_assister_id: string | null
          top_scorer_id: string | null
          total_matches: number | null
          updated_at: string
        }
        Insert: {
          clean_sheets?: number | null
          competition?: string | null
          created_at?: string
          goals_conceded?: number | null
          goals_scored?: number | null
          id?: string
          matches_drawn?: number | null
          matches_lost?: number | null
          matches_won?: number | null
          season: string
          top_assister_id?: string | null
          top_scorer_id?: string | null
          total_matches?: number | null
          updated_at?: string
        }
        Update: {
          clean_sheets?: number | null
          competition?: string | null
          created_at?: string
          goals_conceded?: number | null
          goals_scored?: number | null
          id?: string
          matches_drawn?: number | null
          matches_lost?: number | null
          matches_won?: number | null
          season?: string
          top_assister_id?: string | null
          top_scorer_id?: string | null
          total_matches?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "season_statistics_top_assister_id_fkey"
            columns: ["top_assister_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "season_statistics_top_scorer_id_fkey"
            columns: ["top_scorer_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_totp_secrets: {
        Row: {
          backup_codes: string[] | null
          backup_codes_encrypted: string[] | null
          created_at: string | null
          encrypted_secret: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          backup_codes_encrypted?: string[] | null
          created_at?: string | null
          encrypted_secret: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          backup_codes_encrypted?: string[] | null
          created_at?: string | null
          encrypted_secret?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_key: string
          content_type: string | null
          content_value: string
          created_at: string
          description: string | null
          id: string
          language: string | null
          section: string
          updated_at: string
        }
        Insert: {
          content_key: string
          content_type?: string | null
          content_value: string
          created_at?: string
          description?: string | null
          id?: string
          language?: string | null
          section: string
          updated_at?: string
        }
        Update: {
          content_key?: string
          content_type?: string | null
          content_value?: string
          created_at?: string
          description?: string | null
          id?: string
          language?: string | null
          section?: string
          updated_at?: string
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
      site_visibility: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_visible: boolean
          parent_key: string | null
          section_key: string
          section_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_visible?: boolean
          parent_key?: string | null
          section_key: string
          section_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_visible?: boolean
          parent_key?: string | null
          section_key?: string
          section_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          platform: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          updated_at?: string
          url?: string
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
      transfers: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          from_team: string
          from_team_logo: string | null
          id: string
          is_official: boolean | null
          is_published: boolean | null
          player_id: string | null
          player_image: string | null
          player_name: string
          return_date: string | null
          to_team: string
          to_team_logo: string | null
          transfer_date: string | null
          transfer_fee: string | null
          transfer_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          from_team: string
          from_team_logo?: string | null
          id?: string
          is_official?: boolean | null
          is_published?: boolean | null
          player_id?: string | null
          player_image?: string | null
          player_name: string
          return_date?: string | null
          to_team: string
          to_team_logo?: string | null
          transfer_date?: string | null
          transfer_fee?: string | null
          transfer_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          from_team?: string
          from_team_logo?: string | null
          id?: string
          is_official?: boolean | null
          is_published?: boolean | null
          player_id?: string | null
          player_image?: string | null
          player_name?: string
          return_date?: string | null
          to_team?: string
          to_team_logo?: string | null
          transfer_date?: string | null
          transfer_fee?: string | null
          transfer_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
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
      welcome_popup_settings: {
        Row: {
          button_text: string | null
          created_at: string
          delay_ms: number | null
          features: Json | null
          id: string
          is_enabled: boolean | null
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          created_at?: string
          delay_ms?: number | null
          features?: Json | null
          id?: string
          is_enabled?: boolean | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          created_at?: string
          delay_ms?: number | null
          features?: Json | null
          id?: string
          is_enabled?: boolean | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          category: string | null
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
          category?: string | null
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
          category?: string | null
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
      article_comments_public: {
        Row: {
          article_id: string | null
          content: string | null
          created_at: string | null
          id: string | null
          is_approved: boolean | null
          is_published: boolean | null
          updated_at: string | null
          user_name: string | null
        }
        Insert: {
          article_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_approved?: boolean | null
          is_published?: boolean | null
          updated_at?: string | null
          user_name?: string | null
        }
        Update: {
          article_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_approved?: boolean | null
          is_published?: boolean | null
          updated_at?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_leaderboard_public: {
        Row: {
          best_streak: number | null
          correct_outcomes: number | null
          correct_scores: number | null
          created_at: string | null
          current_streak: number | null
          id: string | null
          total_points: number | null
          total_predictions: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          best_streak?: number | null
          correct_outcomes?: number | null
          correct_scores?: number | null
          created_at?: string | null
          current_streak?: number | null
          id?: string | null
          total_points?: number | null
          total_predictions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          best_streak?: number | null
          correct_outcomes?: number | null
          correct_scores?: number | null
          created_at?: string | null
          current_streak?: number | null
          id?: string | null
          total_points?: number | null
          total_predictions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      check_login_blocked: {
        Args: { p_email: string; p_ip_address?: string }
        Returns: {
          blocked_until: string
          failed_attempts: number
          is_blocked: boolean
        }[]
      }
      check_player_stats_alerts: { Args: never; Returns: undefined }
      check_rate_limit: {
        Args: {
          p_action: string
          p_block_seconds?: number
          p_identifier: string
          p_max_attempts?: number
          p_window_seconds?: number
        }
        Returns: Json
      }
      cleanup_rate_limits: { Args: never; Returns: number }
      confirm_newsletter_subscription: {
        Args: { p_confirmation_token: string; p_email: string }
        Returns: boolean
      }
      delete_totp_secret: { Args: { p_user_id: string }; Returns: undefined }
      get_admin_emails: { Args: never; Returns: string[] }
      get_encryption_key: { Args: never; Returns: string }
      get_moderator_activity_stats: {
        Args: { p_days?: number }
        Returns: {
          articles_published: number
          comments_moderated: number
          flash_news_published: number
          last_action_at: string
          moderator_email: string
          moderator_id: string
          total_actions: number
        }[]
      }
      get_recent_moderator_actions: {
        Args: { p_limit?: number; p_moderator_id?: string }
        Returns: {
          action_type: string
          created_at: string
          details: Json
          entity_id: string
          entity_title: string
          entity_type: string
          id: string
          moderator_email: string
          moderator_id: string
        }[]
      }
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
      get_totp_secret: { Args: { p_user_id: string }; Returns: string }
      get_user_email_by_id: { Args: { p_user_id: string }; Returns: string }
      get_users_with_roles: {
        Args: never
        Returns: {
          created_at: string
          email: string
          role: string
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
      is_email_domain_blocked: {
        Args: { p_email: string }
        Returns: {
          domain: string
          is_blocked: boolean
          reason: string
        }[]
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_details?: Json
          p_entity_id?: string
          p_entity_type: string
        }
        Returns: string
      }
      log_login_attempt: {
        Args: {
          p_email: string
          p_ip_address?: string
          p_success: boolean
          p_user_agent?: string
        }
        Returns: undefined
      }
      log_moderator_action: {
        Args: {
          p_action_type: string
          p_details?: Json
          p_entity_id?: string
          p_entity_title?: string
          p_entity_type: string
        }
        Returns: string
      }
      normalize_competition_name: {
        Args: { input_name: string }
        Returns: string
      }
      publish_scheduled_articles: { Args: never; Returns: undefined }
      publish_scheduled_flash_news: { Args: never; Returns: undefined }
      save_backup_codes: {
        Args: { p_codes: string[]; p_user_id: string }
        Returns: boolean
      }
      save_totp_secret: {
        Args: { p_secret: string; p_user_id: string }
        Returns: string
      }
      subscribe_to_newsletter: {
        Args: { p_email: string; p_subscription_type?: string }
        Returns: string
      }
      unsubscribe_newsletter: {
        Args: { p_confirmation_token: string; p_email: string }
        Returns: boolean
      }
      update_all_players_ages: { Args: never; Returns: undefined }
      update_player_objectives_progress: { Args: never; Returns: undefined }
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
