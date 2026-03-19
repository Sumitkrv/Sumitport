import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { getSmoother, setSmoother } from "./utils/smoother";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

const Navbar = () => {
  useEffect(() => {
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.7,
      speed: 1.7,
      effects: true,
      autoResize: true,
      ignoreMobileResize: true,
    });
    setSmoother(smoother);

    smoother.scrollTop(0);
    smoother.paused(true);

    const links = document.querySelectorAll(".header ul a");
    const clickHandlers: Array<{
      element: HTMLAnchorElement;
      handler: (e: MouseEvent) => void;
    }> = [];

    links.forEach((elem) => {
      const element = elem as HTMLAnchorElement;
      const handler = (e: MouseEvent) => {
        if (window.innerWidth > 1024) {
          e.preventDefault();
          const elem = e.currentTarget as HTMLAnchorElement;
          const section = elem.getAttribute("data-href");
          const instance = getSmoother();
          instance?.scrollTo(section, true, "top top");
        }
      };
      element.addEventListener("click", handler);
      clickHandlers.push({ element, handler });
    });

    const onResize = () => {
      ScrollSmoother.refresh(true);
    };
    window.addEventListener("resize", onResize);

    return () => {
      clickHandlers.forEach(({ element, handler }) => {
        element.removeEventListener("click", handler);
      });
      window.removeEventListener("resize", onResize);
      smoother.kill();
      setSmoother(null);
    };
  }, []);
  return (
    <>
      <div className="header">
        <a href="/#" className="navbar-title" data-cursor="disable">
          ST
        </a>
        <a
          href="mailto:thakursumi498@gmail.com"
          className="navbar-connect"
          data-cursor="disable"
        >
          thakursumi498@gmail.com
        </a>
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
