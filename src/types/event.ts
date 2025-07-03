
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  location_url?: string;
  category: string;
  image_url: string;
  media_type?: 'image' | 'video' | 'gif';
  organizer_id: string;
  created_at?: string;
  latitude?: number | null;
  longitude?: number | null;
  registration_count: number;
  city?: string;
  country?: string;
  is_online?: boolean;
  webinar_link?: string;
  view_count?: number;
  likes_count?: number;
  address?: string;
  is_public?: boolean;
}

export type EventFormData = Omit<Event, "id" | "organizer_id" | "created_at" | "registration_count" | "view_count" | "likes_count"> & {
  imageFile?: File | null;
  categories?: string[];
};
