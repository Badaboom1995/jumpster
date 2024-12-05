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
      boosters: {
        Row: {
          created_at: string | null
          description: string
          duration_type: Database["public"]["Enums"]["booster_duration_type"]
          duration_value: number | null
          effect_type: Database["public"]["Enums"]["booster_effect_type"]
          effect_value: number
          icon_url: string | null
          id: string
          name: string
          price: number | null
          rarity: Database["public"]["Enums"]["booster_rarity"]
        }
        Insert: {
          created_at?: string | null
          description: string
          duration_type: Database["public"]["Enums"]["booster_duration_type"]
          duration_value?: number | null
          effect_type: Database["public"]["Enums"]["booster_effect_type"]
          effect_value: number
          icon_url?: string | null
          id?: string
          name: string
          price?: number | null
          rarity: Database["public"]["Enums"]["booster_rarity"]
        }
        Update: {
          created_at?: string | null
          description?: string
          duration_type?: Database["public"]["Enums"]["booster_duration_type"]
          duration_value?: number | null
          effect_type?: Database["public"]["Enums"]["booster_effect_type"]
          effect_value?: number
          icon_url?: string | null
          id?: string
          name?: string
          price?: number | null
          rarity?: Database["public"]["Enums"]["booster_rarity"]
        }
        Relationships: []
      }
      earn_cards: {
        Row: {
          buy_price: number | null
          created_at: string
          id: number
          name: string | null
          passive_income: number | null
          thumbnail_name: string | null
        }
        Insert: {
          buy_price?: number | null
          created_at?: string
          id?: number
          name?: string | null
          passive_income?: number | null
          thumbnail_name?: string | null
        }
        Update: {
          buy_price?: number | null
          created_at?: string
          id?: number
          name?: string | null
          passive_income?: number | null
          thumbnail_name?: string | null
        }
        Relationships: []
      }
      jump_sessions: {
        Row: {
          created_at: string
          energy_left: number
          id: number
          jumps: number
          seconds: number
          user_id: number | null
        }
        Insert: {
          created_at?: string
          energy_left: number
          id?: number
          jumps: number
          seconds: number
          user_id?: number | null
        }
        Update: {
          created_at?: string
          energy_left?: number
          id?: number
          jumps?: number
          seconds?: number
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "JumpSession_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: number
          link: string | null
          points: number
          quest_type: string
          title: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          link?: string | null
          points: number
          quest_type: string
          title: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          link?: string | null
          points?: number
          quest_type?: string
          title?: string
        }
        Relationships: []
      }
      ranks: {
        Row: {
          coins_multiplier: number | null
          description: string | null
          energy_level: number | null
          energy_recover: number | null
          experience: number | null
          id: number
          title: string | null
        }
        Insert: {
          coins_multiplier?: number | null
          description?: string | null
          energy_level?: number | null
          energy_recover?: number | null
          experience?: number | null
          id: number
          title?: string | null
        }
        Update: {
          coins_multiplier?: number | null
          description?: string | null
          energy_level?: number | null
          energy_recover?: number | null
          experience?: number | null
          id?: number
          title?: string | null
        }
        Relationships: []
      }
      user_boosters: {
        Row: {
          activated_at: string | null
          booster_id: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          user_id: number | null
        }
        Insert: {
          activated_at?: string | null
          booster_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: number | null
        }
        Update: {
          activated_at?: string | null
          booster_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_boosters_booster_id_fkey"
            columns: ["booster_id"]
            isOneToOne: false
            referencedRelation: "boosters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_boosters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cards: {
        Row: {
          card_id: number | null
          created_at: string
          id: number
          user_id: number | null
        }
        Insert: {
          card_id?: number | null
          created_at?: string
          id?: number
          user_id?: number | null
        }
        Update: {
          card_id?: number | null
          created_at?: string
          id?: number
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "earn_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_parameters: {
        Row: {
          created_at: string
          id: number
          max_value: number | null
          name: string | null
          recovery_rate: number | null
          updated_at: string | null
          user_id: number | null
          value: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          max_value?: number | null
          name?: string | null
          recovery_rate?: number | null
          updated_at?: string | null
          user_id?: number | null
          value?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          max_value?: number | null
          name?: string | null
          recovery_rate?: number | null
          updated_at?: string | null
          user_id?: number | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "UserParameters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quests: {
        Row: {
          completed_at: string | null
          id: number
          quest_id: number | null
          user_id: number | null
        }
        Insert: {
          completed_at?: string | null
          id?: number
          quest_id?: number | null
          user_id?: number | null
        }
        Update: {
          completed_at?: string | null
          id?: number
          quest_id?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_quests_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          coins: number | null
          created_at: string
          energy_per_jump: number | null
          experience: number
          id: number
          last_activity_date: string | null
          onboarding_done: boolean | null
          streak_counter: number | null
          telegram_id: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          coins?: number | null
          created_at?: string
          energy_per_jump?: number | null
          experience?: number
          id?: number
          last_activity_date?: string | null
          onboarding_done?: boolean | null
          streak_counter?: number | null
          telegram_id?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          coins?: number | null
          created_at?: string
          energy_per_jump?: number | null
          experience?: number
          id?: number
          last_activity_date?: string | null
          onboarding_done?: boolean | null
          streak_counter?: number | null
          telegram_id?: number | null
          updated_at?: string | null
          username?: string | null
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
      booster_duration_type: "one_session" | "timed" | "permanent"
      booster_effect_type:
        | "coins_multiplier"
        | "energy_recovery"
        | "experience_multiplier"
        | "jump_power"
        | "energy_cost_reduction"
      booster_rarity: "common" | "rare" | "epic" | "legendary"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
