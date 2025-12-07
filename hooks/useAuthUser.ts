"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

interface UserMetadata {
  name: string;
  user_name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
}

interface AuthUser {
  email: string;
  username: string | null;
  token: string | null;
  metadata: UserMetadata | null;
}

const USER_CACHE_KEY = "cached_user_data";

export function useAuthUser() {
  const supabase = createClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userSecure, setUserSecure] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const isLoadingRef = useRef(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);

    // Load from cache after hydration
    try {
      const cached = localStorage.getItem(USER_CACHE_KEY);
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch {
      // Ignore cache errors
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    async function loadUser() {
      try {
        const [{ data: userData }, { data: sessionData }] = await Promise.all([
          supabase.auth.getUser(),
          supabase.auth.getSession(),
        ]);

        const authUser = userData.user;
        const session = sessionData.session;

        if (!authUser || !session) {
          setUser(null);
          localStorage.removeItem(USER_CACHE_KEY);
          setLoading(false);
          return;
        }

        const metadata = authUser.user_metadata as UserMetadata;
        const token = session.provider_token ?? null;


        const userInfo: AuthUser = {
          email: authUser.email ?? "",
          username: metadata?.user_name ?? null,
          metadata,
          token,
        };

        setUserSecure(userInfo);

        setUser(userInfo);

        const cacheData = {
          email: userInfo.email,
          username: userInfo.username,
          metadata: userInfo.metadata,
          token: null,
        };
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData));
        setLoading(false);
      } catch (error) {
        console.error("Error loading user:", error);
        setLoading(false);
      }
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem(USER_CACHE_KEY);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        isLoadingRef.current = false;
        loadUser();
      }
    });

    return () => {
      listener.subscription.unsubscribe();
      isLoadingRef.current = false;
    };
  }, [supabase, isHydrated]);

  return { user, userSecure, loading };
}
