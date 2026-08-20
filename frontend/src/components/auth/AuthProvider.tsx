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
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [user, setUser] = useState<{
    id: string;
    fullName: string;
    primaryEmailAddress: { emailAddress: string };
  } | null>({
    id: "user_dev_01",
    fullName: "Alex Dev",
    primaryEmailAddress: { emailAddress: "alex@developer.io" },
  });

  useEffect(() => {
    const loaded = getStoredProfile();
    setProfileState(loaded);
    if (loaded.name) {
      setUser({
        id: "user_dev_01",
        fullName: loaded.name,
        primaryEmailAddress: { emailAddress: loaded.email || "alex@developer.io" },
      });
      setIsSignedIn(true);
    }
  }, []);

  const setProfile = (updated: Partial<CandidateProfile>) => {
    const res = saveStoredProfile(updated);
    setProfileState(res);
  };

  const signInMock = (name: string, email: string) => {
    const res = saveStoredProfile({ name, email });
    setProfileState(res);
    setUser({
      id: "user_dev_01",
      fullName: name,
      primaryEmailAddress: { emailAddress: email },
    });
    setIsSignedIn(true);
  };

  const signOutMock = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("rozgar_profile");
      // Also notify backend to delete mock profile and clear state
      try {
        await fetch("http://localhost:8000/api/reset", { method: "POST" });
      } catch (e) {
        console.error("Failed to reset backend state", e);
      }
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
