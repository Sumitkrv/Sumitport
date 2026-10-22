import { useEffect, useState } from "react";
import "./styles/Loading.css";

type LoadingProps = { ready: boolean; onComplete: () => void };

const Loading = ({ ready, onComplete }: LoadingProps) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const exitTimer = window.setTimeout(() => setExiting(true), reducedMotion ? 0 : 450);
    const completeTimer = window.setTimeout(() => {
      import("./utils/initialFX").then(({ initialFX }) => initialFX());
      onComplete();
    }, reducedMotion ? 200 : 1150);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [ready, onComplete]);

  return (
    <div className={`loading-screen${exiting ? " loading-screen-exit" : ""}`} aria-live="polite" aria-label="Loading portfolio">
      <div className="loading-header">
        <span className="loader-title">ST</span>
        <span className="loader-kicker">SUMIT THAKUR · PORTFOLIO</span>
      </div>
      <div className="loading-editorial" aria-hidden="true">
        <span>Software Developer</span>
        <span>Full-Stack Developer</span>
      </div>
      <div className="loading-center">
        <div className="loading-orbit" aria-hidden="true"><i /><i /><i /></div>
        <div className="loading-capsule"><span className="loading-capsule-fill" /><span className="loading-capsule-label">{ready ? "WELCOME" : "PREPARING YOUR EXPERIENCE"}</span></div>
        <span className="loading-caption">{ready ? "Ready to explore" : "A little moment, please"}</span>
      </div>
    </div>
  );
};

export default Loading;
