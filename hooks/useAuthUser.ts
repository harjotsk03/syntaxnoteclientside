"use client";

import { useEffect, useState, useRef } from "react";

interface AuthUser {
  email: string;
  id: string;
}

const USER_CACHE_KEY = "cached_user_data";

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const isLoadingRef = useRef(false);

  // Handle hydration and load cache
  useEffect(() => {
    setIsHydrated(true);
    try {
      const cached = localStorage.getItem(USER_CACHE_KEY);
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch {
      // ignore cache errors
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    async function loadUser() {
      const token = localStorage.getItem("jwt");
      if (!token) {
        setUser(null);
        localStorage.removeItem(USER_CACHE_KEY);
        setLoading(false);
        isLoadingRef.current = false;
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setUser(null);
          localStorage.removeItem(USER_CACHE_KEY);
          setLoading(false);
          isLoadingRef.current = false;
          return;
        }

        const data = await response.json();
        const authUser: AuthUser = {
          email: data.email,
          id: data.user_id,
        };

        setUser(authUser);
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(authUser));
        setLoading(false);
        isLoadingRef.current = false;
      } catch (error) {
        console.error("Error loading user:", error);
        setUser(null);
        localStorage.removeItem(USER_CACHE_KEY);
        setLoading(false);
        isLoadingRef.current = false;
      }
    }

    loadUser();
  }, [isHydrated]);

  return { user, loading };
}
