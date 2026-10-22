import { lazy, PropsWithChildren, Suspense, useEffect, useRef, useState } from "react";
import SceneBoundary from "./SceneBoundary";
import About from "./About";
import Achievements from "./Achievements";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import Skills from "./Skills";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import setSplitText from "./utils/splitText";

const TechStack = lazy(() => import("./TechStack"));

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );

  const [techStackRequested, setTechStackRequested] = useState(false);
  const techPlaceholderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isDesktopView || techStackRequested || !techPlaceholderRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setTechStackRequested(true);
    }, { rootMargin: "800px 0px" });
    observer.observe(techPlaceholderRef.current);
    return () => observer.disconnect();
  }, [isDesktopView, techStackRequested]);

  useEffect(() => {
    let viewportWidth = window.innerWidth;
    let resizeTimer = 0;
    let disposeSplitText = setSplitText();

    const resizeHandler = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (window.innerWidth !== viewportWidth) {
          viewportWidth = window.innerWidth;
          disposeSplitText();
          disposeSplitText = setSplitText();
        }
        setIsDesktopView(window.innerWidth > 1024);
      }, 120);
    };
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", resizeHandler);
      disposeSplitText();
    };
  }, []);

  return (
    <div className="container-main">
      <Cursor />
      <Navbar />
      {isDesktopView && children}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            <Landing>{!isDesktopView && children}</Landing>
            <About />
            <WhatIDo />
            <Career />
            <Work />
            <Achievements />
            <Skills />
            {isDesktopView && (techStackRequested ? (
              <SceneBoundary fallback={<div className="techstack"><h2>My Techstack</h2><p className="techstack-fallback">The 3D view is unavailable. Technology details are listed in Technical Skills above.</p></div>}>
                <Suspense fallback={<div className="techstack" aria-busy="true"><h2>My Techstack</h2></div>}>
                  <TechStack />
                </Suspense>
              </SceneBoundary>
            ) : <div ref={techPlaceholderRef} className="techstack" aria-busy="true"><h2>My Techstack</h2></div>)}
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
