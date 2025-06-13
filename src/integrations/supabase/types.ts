export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          description: string | null
          goal_id: string | null
          icon: string | null
          id: string
          points_earned: number | null
          title: string
          type: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          description?: string | null
          goal_id?: string | null
          icon?: string | null
          id?: string
          points_earned?: number | null
          title: string
          type: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          description?: string | null
          goal_id?: string | null
          icon?: string | null
          id?: string
          points_earned?: number | null
          title?: string
          type?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_sessions: {
        Row: {
          booking_id: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          session_date: string
          session_notes: string | null
          status: string | null
          user_id: string | null
          zoom_link: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          session_date: string
          session_notes?: string | null
          status?: string | null
          user_id?: string | null
          zoom_link?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          session_date?: string
          session_notes?: string | null
          status?: string | null
          user_id?: string | null
          zoom_link?: string | null
        }
        Relationships: []
      }
      content_purchases: {
        Row: {
          access_expires_at: string | null
          content_id: string
          content_type: string
          id: string
          price_paid: number
          purchase_date: string
          user_id: string | null
        }
        Insert: {
          access_expires_at?: string | null
          content_id: string
          content_type: string
          id?: string
          price_paid: number
          purchase_date?: string
          user_id?: string | null
        }
        Update: {
          access_expires_at?: string | null
          content_id?: string
          content_type?: string
          id?: string
          price_paid?: number
          purchase_date?: string
          user_id?: string | null
        }
        Relationships: []
      }
      daily_coaching: {
        Row: {
          action_step: string
          affirmation: string
          completed: boolean | null
          created_at: string | null
          date: string | null
          goal_id: string
          id: string
          mood_score: number | null
          reflection: string | null
          user_id: string
        }
        Insert: {
          action_step: string
          affirmation: string
          completed?: boolean | null
          created_at?: string | null
          date?: string | null
          goal_id: string
          id?: string
          mood_score?: number | null
          reflection?: string | null
          user_id: string
        }
        Update: {
          action_step?: string
          affirmation?: string
          completed?: boolean | null
          created_at?: string | null
          date?: string | null
          goal_id?: string
          id?: string
          mood_score?: number | null
          reflection?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_coaching_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_coaching_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          is_premium: boolean | null
          suggested_duration_days: number | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          is_premium?: boolean | null
          suggested_duration_days?: number | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          is_premium?: boolean | null
          suggested_duration_days?: number | null
          title?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          archived: boolean | null
          category: string
          completed_days: number | null
          created_at: string | null
          daily_streak: number | null
          deadline: string
          description: string
          id: string
          is_active: boolean | null
          progress: number | null
          signature: string | null
          tags: string[] | null
          title: string
          total_days: number
          updated_at: string | null
          user_id: string
          why_it_matters: string
        }
        Insert: {
          archived?: boolean | null
          category: string
          completed_days?: number | null
          created_at?: string | null
          daily_streak?: number | null
          deadline: string
          description: string
          id?: string
          is_active?: boolean | null
          progress?: number | null
          signature?: string | null
          tags?: string[] | null
          title: string
          total_days: number
          updated_at?: string | null
          user_id: string
          why_it_matters: string
        }
        Update: {
          archived?: boolean | null
          category?: string
          completed_days?: number | null
          created_at?: string | null
          daily_streak?: number | null
          deadline?: string
          description?: string
          id?: string
          is_active?: boolean | null
          progress?: number | null
          signature?: string | null
          tags?: string[] | null
          title?: string
          total_days?: number
          updated_at?: string | null
          user_id?: string
          why_it_matters?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_points: {
        Row: {
          current_level: number | null
          daily_bonus: number | null
          earned_points: number | null
          id: string
          premium_multiplier: number | null
          spent_points: number | null
          streak_bonus: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_level?: number | null
          daily_bonus?: number | null
          earned_points?: number | null
          id?: string
          premium_multiplier?: number | null
          spent_points?: number | null
          streak_bonus?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_level?: number | null
          daily_bonus?: number | null
          earned_points?: number | null
          id?: string
          premium_multiplier?: number | null
          spent_points?: number | null
          streak_bonus?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "growth_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      premium_content: {
        Row: {
          content_type: string
          created_at: string
          description: string
          file_url: string | null
          id: string
          is_active: boolean | null
          preview_content: string | null
          price: number
          title: string
        }
        Insert: {
          content_type: string
          created_at?: string
          description: string
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          preview_content?: string | null
          price: number
          title: string
        }
        Update: {
          content_type?: string
          created_at?: string
          description?: string
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          preview_content?: string | null
          price?: number
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          daily_reminder_time: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          preferences: Json | null
          subscription_tier: string | null
          timezone: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          daily_reminder_time?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          preferences?: Json | null
          subscription_tier?: string | null
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          daily_reminder_time?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          preferences?: Json | null
          subscription_tier?: string | null
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      progress_logs: {
        Row: {
          completed: boolean | null
          created_at: string | null
          date: string | null
          goal_id: string
          id: string
          notes: string | null
          photo_url: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          date?: string | null
          goal_id: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          date?: string | null
          goal_id?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_logs_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      redemptions: {
        Row: {
          id: string
          points_spent: number
          redeemed_at: string | null
          reward_id: string
          status: string | null
          tracking_code: string | null
          user_id: string
        }
        Insert: {
          id?: string
          points_spent: number
          redeemed_at?: string | null
          reward_id: string
          status?: string | null
          tracking_code?: string | null
          user_id: string
        }
        Update: {
          id?: string
          points_spent?: number
          redeemed_at?: string | null
          reward_id?: string
          status?: string | null
          tracking_code?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reflections: {
        Row: {
          achievements_today: string[] | null
          challenges_faced: string | null
          created_at: string
          date: string | null
          goal_id: string | null
          gratitude_note: string | null
          id: string
          lessons_learned: string | null
          mood_score: number | null
          reflection_text: string | null
          tomorrow_intention: string | null
          user_id: string | null
        }
        Insert: {
          achievements_today?: string[] | null
          challenges_faced?: string | null
          created_at?: string
          date?: string | null
          goal_id?: string | null
          gratitude_note?: string | null
          id?: string
          lessons_learned?: string | null
          mood_score?: number | null
          reflection_text?: string | null
          tomorrow_intention?: string | null
          user_id?: string | null
        }
        Update: {
          achievements_today?: string[] | null
          challenges_faced?: string | null
          created_at?: string
          date?: string | null
          goal_id?: string | null
          gratitude_note?: string | null
          id?: string
          lessons_learned?: string | null
          mood_score?: number | null
          reflection_text?: string | null
          tomorrow_intention?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reflections_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          available: boolean | null
          brand_partner: string | null
          category: string
          created_at: string | null
          description: string
          external_id: string | null
          id: string
          image_url: string | null
          is_premium: boolean | null
          points_cost: number
          title: string
        }
        Insert: {
          available?: boolean | null
          brand_partner?: string | null
          category: string
          created_at?: string | null
          description: string
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          points_cost: number
          title: string
        }
        Update: {
          available?: boolean | null
          brand_partner?: string | null
          category?: string
          created_at?: string | null
          description?: string
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          points_cost?: number
          title?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          priority: number | null
          progress: number | null
          status: string | null
          target_date: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          priority?: number | null
          progress?: number | null
          status?: string | null
          target_date?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: number | null
          progress?: number | null
          status?: string | null
          target_date?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
