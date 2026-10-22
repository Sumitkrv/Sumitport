import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import Loading from "../components/Loading";
import { LoadingContext } from "./loadingContext";

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const markReady = useCallback(() => setIsReady(true), []);
  const finishLoading = useCallback(() => setIsLoading(false), []);

  useEffect(() => {
    // A failed or unsupported WebGL/model load must never hold the page hostage.
    const fallback = window.setTimeout(markReady, 8000);
    return () => window.clearTimeout(fallback);
  }, [markReady]);

  const value = {
    isLoading,
    setIsLoading,
    markReady,
  };

  return (
    <LoadingContext.Provider value={value}>
      {isLoading && <Loading ready={isReady} onComplete={finishLoading} />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};
