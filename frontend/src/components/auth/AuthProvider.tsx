"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CandidateProfile } from "@/lib/types";
import { DEFAULT_PROFILE, getStoredProfile, saveStoredProfile } from "@/lib/storage";

interface AuthContextType {
  isSignedIn: boolean;
  user: {
    id: string;
    fullName: string;
    primaryEmailAddress: { emailAddress: string };
  } | null;
  profile: CandidateProfile;
  setProfile: (profile: Partial<CandidateProfile>) => void;
  signInMock: (name: string, email: string) => void;
  signOutMock: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  user: null,
  profile: DEFAULT_PROFILE,
  setProfile: () => {},
  signInMock: () => {},
  signOutMock: () => {},
});

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<CandidateProfile>(DEFAULT_PROFILE);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    fullName: string;
    primaryEmailAddress: { emailAddress: string };
  } | null>(null);

  useEffect(() => {
    const isAuth = typeof window !== "undefined" && localStorage.getItem("rozgar_auth_active") === "true";
    const loaded = getStoredProfile();
    setProfileState(loaded);
    if (isAuth) {
      setUser({
        id: "user_dev_01",
        fullName: loaded.name || "Alex Dev",
        primaryEmailAddress: { emailAddress: loaded.email || "alex@developer.io" },
      });
      setIsSignedIn(true);
    } else {
      setIsSignedIn(false);
      setUser(null);
    }
  }, []);

  const setProfile = (updated: Partial<CandidateProfile>) => {
    const res = saveStoredProfile(updated);
    setProfileState(res);
  };

  const signInMock = (name: string, email: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rozgar_auth_active", "true");
    }
    const res = saveStoredProfile({ name, email });
    setProfileState(res);
    setUser({
      id: "user_dev_01",
      fullName: name,
      primaryEmailAddress: { emailAddress: email },
    });
    setIsSignedIn(true);
  };

  const signOutMock = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("rozgar_auth_active");
      localStorage.removeItem("rozgar_candidate_profile");
      // Fire-and-forget backend reset in background without blocking UI navigation
      fetch("http://localhost:8000/api/reset", { method: "POST" }).catch((e) => {
        console.warn("Backend reset ping:", e);
      });
    }
    setProfileState(DEFAULT_PROFILE);
    setIsSignedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        user,
        profile,
        setProfile,
        signInMock,
        signOutMock,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAppAuth() {
  return useContext(AuthContext);
}
