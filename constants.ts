import { TruckType } from './types';

// Helper function to safely retrieve environment variables
function getEnvVar(key: string, fallback: string): string {
  try {
    // Check if import.meta.env exists (Vite standard)
    const meta = import.meta as any;
    if (meta && meta.env && meta.env[key]) {
      return meta.env[key];
    }
  } catch (err) {
    // Ignore errors if import.meta is not available
  }
  return fallback;
}

export const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL', 'https://xwmzhvttkvbpcldhgzdw.supabase.co');
export const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3bXpodnR0a3ZicGNsZGhnemR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTUzNDYsImV4cCI6MjA3OTAzMTM0Nn0.kC-EspJwE5rrYvLzLdXsFMgvGwbBW-N7FIxYh6AAyL0');

export const TRUCK_TYPES: TruckType[] = [
  'Semi-Truck',
  'Box Truck',
  'Flatbed',
  'Refrigerated',
  'Tanker',
  'Other'
];

export const THEMES = [
  'sunset', 
  'aqua', 
  'corporate', 
  'cmyk', 
  'fantasy', 
  "synthwave", 
  "acid", 
  "winter", 
  "caramellatte", 
  "dim"
];

export const ITEMS_PER_PAGE = 20;
export const RECENT_ACTIVITY_DAYS = 7;
export const ACTIVE_TRUCK_DAYS = 30;

