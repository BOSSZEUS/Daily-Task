export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      entries: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          content: string;
          entry_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          content: string;
          entry_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          content?: string;
          entry_date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "entries_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      reminder_schedules: {
        Row: {
          id: string;
          user_id: string;
          email_to: string;
          days_of_week: number[];
          times: string[];
          timezone: string;
          is_active: boolean;
          last_sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_to: string;
          days_of_week?: number[];
          times?: string[];
          timezone?: string;
          is_active?: boolean;
          last_sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_to?: string;
          days_of_week?: number[];
          times?: string[];
          timezone?: string;
          is_active?: boolean;
          last_sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reminder_schedules_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Entry = Database["public"]["Tables"]["entries"]["Row"];
export type ReminderSchedule = Database["public"]["Tables"]["reminder_schedules"]["Row"];
