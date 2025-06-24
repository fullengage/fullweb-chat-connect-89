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
      accounts: {
        Row: {
          city: string | null
          cnpj: string | null
          created_at: string | null
          current_conversations: number | null
          current_users: number | null
          description: string | null
          email: string
          id: number
          industry: string | null
          is_active: boolean | null
          name: string
          phone: string | null
          plan_id: number | null
          state: string | null
          subscription_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          cnpj?: string | null
          created_at?: string | null
          current_conversations?: number | null
          current_users?: number | null
          description?: string | null
          email: string
          id?: number
          industry?: string | null
          is_active?: boolean | null
          name: string
          phone?: string | null
          plan_id?: number | null
          state?: string | null
          subscription_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          cnpj?: string | null
          created_at?: string | null
          current_conversations?: number | null
          current_users?: number | null
          description?: string | null
          email?: string
          id?: number
          industry?: string | null
          is_active?: boolean | null
          name?: string
          phone?: string | null
          plan_id?: number | null
          state?: string | null
          subscription_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_stats: {
        Row: {
          agent_id: string
          attendances: number | null
          avg_response_time_seconds: number | null
          conversations_today: number | null
          created_at: string
          date: string | null
          id: string
          rating: number | null
          resolution_rate: number | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          attendances?: number | null
          avg_response_time_seconds?: number | null
          conversations_today?: number | null
          created_at?: string
          date?: string | null
          id?: string
          rating?: number | null
          resolution_rate?: number | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          attendances?: number | null
          avg_response_time_seconds?: number | null
          conversations_today?: number | null
          created_at?: string
          date?: string | null
          id?: string
          rating?: number | null
          resolution_rate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_stats_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          account_id: number
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          last_activity: string | null
          name: string
          phone: string | null
          role: string
          status: string
          teams: string[] | null
          updated_at: string
        }
        Insert: {
          account_id: number
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          name: string
          phone?: string | null
          role: string
          status?: string
          teams?: string[] | null
          updated_at?: string
        }
        Update: {
          account_id?: number
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          name?: string
          phone?: string | null
          role?: string
          status?: string
          teams?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          account_id: number
          additional_attributes: Json | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: number
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          account_id: number
          additional_attributes?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: number
          additional_attributes?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          account_id: number
          assignee_id: string | null
          contact_id: number
          created_at: string | null
          id: number
          kanban_stage: string | null
          labels: string[] | null
          last_activity_at: string | null
          meta: Json | null
          priority: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          account_id: number
          assignee_id?: string | null
          contact_id: number
          created_at?: string | null
          id?: number
          kanban_stage?: string | null
          labels?: string[] | null
          last_activity_at?: string | null
          meta?: Json | null
          priority?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: number
          assignee_id?: string | null
          contact_id?: number
          created_at?: string | null
          id?: number
          kanban_stage?: string | null
          labels?: string[] | null
          last_activity_at?: string | null
          meta?: Json | null
          priority?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: number
          created_at: string | null
          id: number
          message_type: string | null
          metadata: Json | null
          sender_id: string | null
          sender_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: number
          created_at?: string | null
          id?: number
          message_type?: string | null
          metadata?: Json | null
          sender_id?: string | null
          sender_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: number
          created_at?: string | null
          id?: number
          message_type?: string | null
          metadata?: Json | null
          sender_id?: string | null
          sender_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations_for_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: number
          is_active: boolean | null
          max_agents: number | null
          max_conversations: number | null
          max_users: number | null
          name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: number
          is_active?: boolean | null
          max_agents?: number | null
          max_conversations?: number | null
          max_users?: number | null
          name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: number
          is_active?: boolean | null
          max_agents?: number | null
          max_conversations?: number | null
          max_users?: number | null
          name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          account_id: number
          created_at: string
          department: string
          description: string | null
          id: string
          is_active: boolean | null
          leader_id: string | null
          member_ids: string[] | null
          name: string
          performance_score: number | null
          updated_at: string
        }
        Insert: {
          account_id: number
          created_at?: string
          department: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          member_ids?: string[] | null
          name: string
          performance_score?: number | null
          updated_at?: string
        }
        Update: {
          account_id?: number
          created_at?: string
          department?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          member_ids?: string[] | null
          name?: string
          performance_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_id: number | null
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          isactive: boolean | null
          last_login: string | null
          name: string | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          account_id?: number | null
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          isactive?: boolean | null
          last_login?: string | null
          name?: string | null
          phone?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          account_id?: number | null
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          isactive?: boolean | null
          last_login?: string | null
          name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      conversations_for_stats: {
        Row: {
          account_id: number | null
          assignee: Json | null
          assignee_id: string | null
          contact_id: number | null
          created_at: string | null
          id: number | null
          kanban_stage: string | null
          labels: string[] | null
          last_activity_at: string | null
          meta: Json | null
          priority: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auto_route_conversation: {
        Args: { p_conversation_id: number; p_account_id: number }
        Returns: string
      }
      belongs_to_account: {
        Args: { user_id: string; target_account_id: number }
        Returns: boolean
      }
      can_manage_user: {
        Args: { p_manager_id: string; p_target_account_id: number }
        Returns: boolean
      }
      cleanup_inactive_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_conversations_for_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          assignee_id: string
          status: string
          subject: string
          assignee: Json
        }[]
      }
      get_manageable_users: {
        Args: { p_manager_id: string }
        Returns: {
          id: string
          name: string
          email: string
          role: string
          account_id: number
          account_name: string
          isactive: boolean
          last_login: string
          created_at: string
        }[]
      }
      get_next_available_agent: {
        Args: { p_account_id: number }
        Returns: string
      }
      is_account_admin: {
        Args: { user_id: string; target_account_id: number }
        Returns: boolean
      }
      is_superadmin: {
        Args: { user_id: string }
        Returns: boolean
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
