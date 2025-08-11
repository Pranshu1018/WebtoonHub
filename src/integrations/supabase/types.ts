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
      comics: {
        Row: {
          author_id: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          genre: string
          id: string
          rating: number | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          total_episodes: number | null
          total_likes: number | null
          total_views: number | null
          updated_at: string
        }
        Insert: {
          author_id: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          genre: string
          id?: string
          rating?: number | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          total_episodes?: number | null
          total_likes?: number | null
          total_views?: number | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          genre?: string
          id?: string
          rating?: number | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          total_episodes?: number | null
          total_likes?: number | null
          total_views?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comics_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      episodes: {
        Row: {
          comic_id: string
          content_text: string | null
          created_at: string
          episode_number: number
          id: string
          image_urls: string[] | null
          is_published: boolean | null
          likes: number | null
          published_at: string | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          comic_id: string
          content_text?: string | null
          created_at?: string
          episode_number: number
          id?: string
          image_urls?: string[] | null
          is_published?: boolean | null
          likes?: number | null
          published_at?: string | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          comic_id?: string
          content_text?: string | null
          created_at?: string
          episode_number?: number
          id?: string
          image_urls?: string[] | null
          is_published?: boolean | null
          likes?: number | null
          published_at?: string | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_comic_id_fkey"
            columns: ["comic_id"]
            isOneToOne: false
            referencedRelation: "comics"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          comic_slug: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comic_slug: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comic_slug?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achievements: Json | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          last_read_date: string | null
          reading_streak: number | null
          role: string | null
          total_points: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          achievements?: Json | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          last_read_date?: string | null
          reading_streak?: number | null
          role?: string | null
          total_points?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          achievements?: Json | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          last_read_date?: string | null
          reading_streak?: number | null
          role?: string | null
          total_points?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      publisher_content: {
        Row: {
          comic_id: string
          created_at: string
          episode_id: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_published: boolean | null
          page_number: number | null
          publisher_id: string
          updated_at: string
        }
        Insert: {
          comic_id: string
          created_at?: string
          episode_id: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_published?: boolean | null
          page_number?: number | null
          publisher_id: string
          updated_at?: string
        }
        Update: {
          comic_id?: string
          created_at?: string
          episode_id?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_published?: boolean | null
          page_number?: number | null
          publisher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "publisher_content_comic_id_fkey"
            columns: ["comic_id"]
            isOneToOne: false
            referencedRelation: "comics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publisher_content_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_progress: {
        Row: {
          comic_slug: string
          created_at: string
          current_panel: number
          episode_id: string
          id: string
          last_read_at: string
          points_earned: number | null
          progress_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comic_slug: string
          created_at?: string
          current_panel?: number
          episode_id: string
          id?: string
          last_read_at?: string
          points_earned?: number | null
          progress_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comic_slug?: string
          created_at?: string
          current_panel?: number
          episode_id?: string
          id?: string
          last_read_at?: string
          points_earned?: number | null
          progress_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          comic_id: string | null
          created_at: string
          description: string | null
          episode_id: string | null
          id: string
          points: number
          type: string
          user_id: string
        }
        Insert: {
          comic_id?: string | null
          created_at?: string
          description?: string | null
          episode_id?: string | null
          id?: string
          points?: number
          type: string
          user_id: string
        }
        Update: {
          comic_id?: string | null
          created_at?: string
          description?: string | null
          episode_id?: string | null
          id?: string
          points?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_comic_id_fkey"
            columns: ["comic_id"]
            isOneToOne: false
            referencedRelation: "comics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "publisher" | "reader"
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
      app_role: ["admin", "publisher", "reader"],
    },
  },
} as const
