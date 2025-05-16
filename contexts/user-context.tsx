"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { IUser } from "@/types/user";
import AppServer from "@/lib/server";
import { getCurrentUser, logoutUser } from "@/app/(app)/actions";

interface UserContextType {
  user: IUser | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (updates: Partial<IUser>) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user as IUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (updates: Partial<IUser>) => {
    setUser(updates as IUser);
  };

  const refresh = async () => {
    await fetchUser();
  };

  const logout = async () => {
    setUser(null);
    await logoutUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        error,
        refresh,
        update,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
