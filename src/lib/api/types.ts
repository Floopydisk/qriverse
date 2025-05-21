
import { Json } from "@/integrations/supabase/types";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  updated_at?: string;
  username?: string;
}

export interface QRCode {
  id: string;
  created_at: string;
  name: string;
  type: string;
  content: string;
  user_id: string;
  options: Record<string, any> | null;
  folder_id: string | null;
  scan_count: number;
  active: boolean;
  updated_at?: string;
}

export interface Folder {
  id: string;
  created_at: string;
  name: string;
  user_id: string;
}

export interface ScanStat {
  id: string;
  created_at: string;
  qr_code_id: string;
  country?: string;
  user_agent?: string;
  location?: object | null;
  device?: object | null;
}

export interface DynamicQRCode {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  target_url: string;
  short_code: string;
  active: boolean;
  scan_count?: number;
  qr_image_path?: string;
}

export interface DynamicQRScan {
  id: string;
  dynamic_qr_code_id: string;
  scanned_at: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  ip_address?: string;
  referrer?: string;
  user_agent?: string;
}

// Add the BarcodeData interface
export interface BarcodeData {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  value: string;
  type: string;
}
