"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface GlobalProgressContextType {
  isNavigating: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const GlobalProgressContext = createContext<GlobalProgressContextType>({
  isNavigating: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export const useGlobalProgress = () => useContext(GlobalProgressContext);

function GlobalProgressInternal({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const completeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
  };

  const startLoading = useCallback(() => {
    clearTimers();
    setIsNavigating(true);
    setIsVisible(true);
    setProgress(15);

    // Incrementally advance progress while waiting
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 85;
        }
        // Asymptotic approach towards 85%
        const increment = Math.max(1, Math.floor((85 - prev) * 0.2));
        return prev + increment;
      });
    }, 150);
  }, []);

  const stopLoading = useCallback(() => {
    clearTimers();
    setProgress(100);

    completeTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsNavigating(false);
      setTimeout(() => {
        setProgress(0);
      }, 200);
    }, 300);
  }, []);

  // Complete progress on route/search changes
  useEffect(() => {
    if (isVisible) {
      stopLoading();
    }
  }, [pathname, searchParams]);

  // Global click listener to trigger progress instantly on internal link clicks
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Find closest anchor tag
      const anchor = target.closest("a");
      if (anchor && anchor.href) {
        const isExternal =
          anchor.target === "_blank" ||
          anchor.origin !== window.location.origin ||
          anchor.hasAttribute("download") ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey;

        const isSamePageHash =
          anchor.pathname === window.location.pathname &&
          anchor.search === window.location.search &&
          anchor.hash;

        if (!isExternal && !isSamePageHash) {
          startLoading();
        }
      }
    };

    document.addEventListener("click", handleGlobalClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleGlobalClick, { capture: true });
      clearTimers();
    };
  }, [startLoading]);

  return (
    <GlobalProgressContext.Provider
      value={{ isNavigating, startLoading, stopLoading }}
    >
      {/* ── Top Viewport Glowing Progress Bar ─────────────────────────────── */}
      {isVisible && (
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="fixed top-0 left-0 right-0 h-[3px] z-[99999] pointer-events-none transition-opacity duration-300"
          style={{ opacity: isVisible ? 1 : 0 }}
        >
          {/* Main Glowing Track */}
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-500 transition-all duration-200 ease-out shadow-[0_0_12px_rgba(99,102,241,0.85)] relative"
            style={{ width: `${progress}%` }}
          >
            {/* Trailing Glow Particle */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-white/70 blur-[1px]" />
          </div>
        </div>
      )}

      {children}
    </GlobalProgressContext.Provider>
  );
}

export function GlobalProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<>{children}</>}>
      <GlobalProgressInternal>{children}</GlobalProgressInternal>
    </Suspense>
  );
}
