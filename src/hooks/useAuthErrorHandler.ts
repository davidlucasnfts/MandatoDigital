import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export function useAuthErrorHandler() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        queryClient.clear();
        localStorage.removeItem("sb-access-token");
        localStorage.removeItem("sb-refresh-token");
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.access_token) {
          localStorage.setItem("sb-access-token", session.access_token);
        }
        queryClient.invalidateQueries();
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);
}
