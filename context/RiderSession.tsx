import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
const Context = createContext<{ session: Session | null; ready: boolean }>({
  session: null,
  ready: false,
});
export function RiderSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null),
    [ready, setReady] = useState(false);
  const cache = useQueryClient();
  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    let active = true,
      identity: string | undefined;
    const apply = (value: Session | null) => {
      if (!active) return;
      if (identity !== value?.user.id) {
        cache.clear();
        identity = value?.user.id;
      }
      setSession(value);
      setReady(true);
    };
    const { data } = supabase.auth.onAuthStateChange((_event, value) =>
      apply(value),
    );
    supabase.auth
      .getSession()
      .then(({ data }) => apply(data.session))
      .catch(() => apply(null));
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") supabase?.auth.startAutoRefresh();
      else supabase?.auth.stopAutoRefresh();
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
      subscription.remove();
      supabase?.auth.stopAutoRefresh();
    };
  }, [cache]);
  return (
    <Context.Provider value={{ session, ready }}>{children}</Context.Provider>
  );
}
export const useRiderSession = () => useContext(Context);
