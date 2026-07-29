import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey } from "./supabaseKeys";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = getSupabaseAnonKey();

export const supabase = createBrowserClient(url, key);

export function createSupabaseClient() {
  return createBrowserClient(url, key);
}