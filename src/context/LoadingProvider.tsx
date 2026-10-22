import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import { setScrollLocked } from "../components/utils/smoother";
import Loading from "../components/Loading";
import { LoadingContext } from "./loadingContext";

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const mainRef = useRef<HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const markReady = useCallback(() => setIsReady(true), []);
  const finishLoading = useCallback(() => setIsLoading(false), []);

  useEffect(() => {
    // A failed or unsupported WebGL/model load must never hold the page hostage.
    const fallback = window.setTimeout(markReady, 8000);
    return () => window.clearTimeout(fallback);
  }, [markReady]);

  useEffect(() => {
    setScrollLocked("loading", isLoading);
    if (mainRef.current) mainRef.current.inert = isLoading;
    if (isLoading) return () => setScrollLocked("loading", false);

    let cancelled = false;
    let disposeEntrance: (() => void) | undefined;
    // Optional presentation must never own access to the document.
    import("../components/utils/initialFX").then(({ initialFX }) => {
      if (!cancelled) disposeEntrance = initialFX();
    }).catch(() => undefined);
    return () => {
      cancelled = true;
      disposeEntrance?.();
      setScrollLocked("loading", false);
    };
  }, [isLoading]);

  const value = {
    isLoading,
    setIsLoading,
    markReady,
  };

  return (
    <LoadingContext.Provider value={value}>
      {isLoading && <Loading ready={isReady} onComplete={finishLoading} />}
      <main ref={mainRef} className="main-body" aria-busy={isLoading}>{children}</main>
    </LoadingContext.Provider>
  );
};
