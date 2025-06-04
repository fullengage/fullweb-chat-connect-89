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
          created_at: string | null
          id: number
          name: string
          plan: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          plan?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          plan?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_tags: {
        Row: {
          contact_id: number
          tag_id: number
        }
        Insert: {
          contact_id: number
          tag_id: number
        }
        Update: {
          contact_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "contact_tags_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          account_id: number | null
          avatar_url: string | null
          created_at: string | null
          custom_fields: Json | null
          email: string | null
          id: number
          last_seen: string | null
          name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          account_id?: number | null
          avatar_url?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          id?: number
          last_seen?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: number | null
          avatar_url?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          id?: number
          last_seen?: string | null
          name?: string | null
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
      conversation_tags: {
        Row: {
          conversation_id: number
          tag_id: number
        }
        Insert: {
          conversation_id: number
          tag_id: number
        }
        Update: {
          conversation_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversation_tags_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          account_id: number | null
          assignee_id: string | null
          contact_id: number | null
          created_at: string | null
          id: number
          inbox_id: number | null
          kanban_stage: string | null
          priority: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          account_id?: number | null
          assignee_id?: string | null
          contact_id?: number | null
          created_at?: string | null
          id?: number
          inbox_id?: number | null
          kanban_stage?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: number | null
          assignee_id?: string | null
          contact_id?: number | null
          created_at?: string | null
          id?: number
          inbox_id?: number | null
          kanban_stage?: string | null
          priority?: string | null
          status?: string | null
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
          {
            foreignKeyName: "conversations_inbox_id_fkey"
            columns: ["inbox_id"]
            isOneToOne: false
            referencedRelation: "inboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      inboxes: {
        Row: {
          account_id: number | null
          channel_type: string | null
          created_at: string | null
          id: number
          integration_id: string | null
          name: string
          settings: Json | null
        }
        Insert: {
          account_id?: number | null
          channel_type?: string | null
          created_at?: string | null
          id?: number
          integration_id?: string | null
          name: string
          settings?: Json | null
        }
        Update: {
          account_id?: number | null
          channel_type?: string | null
          created_at?: string | null
          id?: number
          integration_id?: string | null
          name?: string
          settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "inboxes_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_stages: {
        Row: {
          account_id: number | null
          created_at: string | null
          id: number
          name: string
          position: number
        }
        Insert: {
          account_id?: number | null
          created_at?: string | null
          id?: number
          name: string
          position: number
        }
        Update: {
          account_id?: number | null
          created_at?: string | null
          id?: number
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "kanban_stages_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string | null
          conversation_id: number | null
          created_at: string | null
          id: number
          read_at: string | null
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          attachments?: Json | null
          content?: string | null
          conversation_id?: number | null
          created_at?: string | null
          id?: number
          read_at?: string | null
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          attachments?: Json | null
          content?: string | null
          conversation_id?: number | null
          created_at?: string | null
          id?: number
          read_at?: string | null
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          account_id: number | null
          color: string
          id: number
          name: string
        }
        Insert: {
          account_id?: number | null
          color: string
          id?: number
          name: string
        }
        Update: {
          account_id?: number | null
          color?: string
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_id: number | null
          created_at: string | null
          email: string
          id: string
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          account_id?: number | null
          created_at?: string | null
          email: string
          id: string
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          account_id?: number | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
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
