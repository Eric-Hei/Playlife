export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    email: string | null
                    avatar_url: string | null
                    role: string | null
                    user_type: string | null
                    is_super_admin: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    email?: string | null
                    avatar_url?: string | null
                    role?: string | null
                    user_type?: string | null
                    is_super_admin?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    email?: string | null
                    avatar_url?: string | null
                    role?: string | null
                    user_type?: string | null
                    is_super_admin?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            missions: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    location: string | null
                    start_date: string | null
                    end_date: string | null
                    image_url: string | null
                    mission_type: string | null
                    country: string | null
                    city: string | null
                    status: string | null
                    fundraising_url: string | null
                    created_at: string
                    created_by: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    location?: string | null
                    start_date?: string | null
                    end_date?: string | null
                    image_url?: string | null
                    mission_type?: string | null
                    country?: string | null
                    city?: string | null
                    status?: string | null
                    fundraising_url?: string | null
                    created_at?: string
                    created_by?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    location?: string | null
                    start_date?: string | null
                    end_date?: string | null
                    image_url?: string | null
                    mission_type?: string | null
                    fundraising_url?: string | null
                    country?: string | null
                    city?: string | null
                    status?: string | null
                    created_at?: string
                    created_by?: string | null
                }
            }
            mission_media: {
                Row: {
                    id: string
                    mission_id: string
                    media_url: string
                    media_type: string
                    caption: string | null
                    created_at: string
                    created_by: string | null
                }
                Insert: {
                    id?: string
                    mission_id: string
                    media_url: string
                    media_type: string
                    caption?: string | null
                    created_at?: string
                    created_by?: string | null
                }
                Update: {
                    id?: string
                    mission_id?: string
                    media_url?: string
                    media_type?: string
                    caption?: string | null
                    created_at?: string
                    created_by?: string | null
                }
            }
            structures: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    type: string | null
                    address: string | null
                    city: string | null
                    country: string | null
                    contact_name: string | null
                    contact_email: string | null
                    contact_phone: string | null
                    website_url: string | null
                    image_url: string | null
                    status: string | null
                    origin_info: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    type?: string | null
                    address?: string | null
                    city?: string | null
                    country?: string | null
                    contact_name?: string | null
                    contact_email?: string | null
                    contact_phone?: string | null
                    website_url?: string | null
                    image_url?: string | null
                    status?: string | null
                    origin_info?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    type?: string | null
                    address?: string | null
                    city?: string | null
                    country?: string | null
                    contact_name?: string | null
                    contact_email?: string | null
                    contact_phone?: string | null
                    website_url?: string | null
                    image_url?: string | null
                    status?: string | null
                    origin_info?: string | null
                    created_by?: string | null
                    created_at?: string
                }
            }
        }
    }
}
