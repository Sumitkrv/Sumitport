import { lazy, PropsWithChildren, Suspense, useEffect, useState } from "react";
import About from "./About";
import Achievements from "./Achievements";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import Skills from "./Skills";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import setSplitText from "./utils/splitText";

const TechStack = lazy(() => import("./TechStack"));

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );

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
      <SocialIcons />
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
            {isDesktopView && (
              <Suspense fallback={<div>Loading....</div>}>
                <TechStack />
              </Suspense>
            )}
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
