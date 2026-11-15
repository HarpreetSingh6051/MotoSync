import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiUrl, apiBase } from "./environment";

const url = (process.env.EXPO_PUBLIC_SUPABASE_URL || "").trim();

const anonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "").trim();

/**
 * Universal Demo & Live data handling
 */
export const isSupabaseConfigured = Boolean(url && anonKey && apiBase);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      global: {
        fetch: (input, init) => {
          const original = new URL(
            typeof input === "string"
              ? input
              : input instanceof URL
                ? input.href
                : input.url,
          );
          return fetch(
            original.origin === new URL(url).origin &&
              original.pathname.startsWith("/auth/v1/")
              ? apiUrl(original.pathname + original.search)
              : input,
            init,
          );
        },
      },
      auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const dataMode = isSupabaseConfigured ? "live" : "demo";

export const publicMediaUrl = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const base = process.env.EXPO_PUBLIC_R2_PUBLIC_BASE_URL?.trim() || "";
  return base ? `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}` : path;
};
