"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface LookbookContextValue {
  isActive: boolean;
  toggle: () => void;
  setIsActive: (active: boolean) => void;
}

const LookbookContext = createContext<LookbookContextValue>({
  isActive: true,
  toggle: () => {},
  setIsActive: () => {},
});

const STORAGE_KEY = "cool-lookbook-mode";

export function LookbookProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setIsActive(stored === "true");
      }
    } catch {
      // localStorage fallback
    }
  }, []);

  const toggle = () => {
    setIsActive((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleSetIsActive = (val: boolean) => {
    setIsActive(val);
    try {
      localStorage.setItem(STORAGE_KEY, String(val));
    } catch {
      // ignore
    }
  };

  return (
    <LookbookContext.Provider
      value={{
        isActive,
        toggle,
        setIsActive: handleSetIsActive,
      }}
    >
      {children}
    </LookbookContext.Provider>
  );
}

export function useLookbook() {
  return useContext(LookbookContext);
}
