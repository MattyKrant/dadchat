import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for browser usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for browser with SSR support
export const createSupabaseClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Database types (will be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      claims: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_url: string
          file_type: string
          ocr_data: any
          appeal_letter: string | null
          status: 'uploaded' | 'processing' | 'completed' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_url: string
          file_type: string
          ocr_data?: any
          appeal_letter?: string | null
          status?: 'uploaded' | 'processing' | 'completed' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_url?: string
          file_type?: string
          ocr_data?: any
          appeal_letter?: string | null
          status?: 'uploaded' | 'processing' | 'completed' | 'error'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}