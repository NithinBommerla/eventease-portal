
export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  age?: number | null;
  dob?: string | null;
  phone_number?: string;
  country_code?: string;
  gender?: string;
  address?: string;
  bio?: string;
  website?: string;
  country?: string;
  city?: string;
  followers_count?: number;
  following_count?: number;
}

export interface ProfileData {
  username: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  age: number | null;
  dob?: string | Date | null;
  phone_number: string;
  country_code: string; // Required field
  gender: string;
  country?: string;
  city?: string;
  address: string;
  bio: string;
  website: string;
  avatar_url?: string;
  avatarFile?: File | null;
  followers_count?: number;
  following_count?: number;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  in_app_notifications: boolean;
  marketing_emails: boolean;
  event_reminders: boolean;
}

// Database profile type that matches the column names and types from Supabase
export interface DbProfile {
  id: string;
  address: string;
  age: number;
  avatar_url: string;
  bio: string;
  created_at: string;
  first_name: string;
  followers_count: number;
  following_count: number;
  gender: string;
  last_name: string;
  name: string;
  phone_number: string;
  country_code: string;
  updated_at: string;
  username: string;
  website: string;
  dob?: string | null;
  country?: string;
  city?: string;
}
