import { MouseEvent, PropsWithChildren, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollToSection as navigateToSection } from "./utils/smoother";
import "./styles/Landing.css";
import SocialIcons from "./SocialIcons";

gsap.registerPlugin(ScrollTrigger);

const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  navigateToSection(id);
  window.history.replaceState(null, "", `#${id}`);
};

const Landing = ({ children }: PropsWithChildren) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollCueRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const cue = scrollCueRef.current;
    if (!section || !cue) return;

    const updateModelSlot = () => {
      const slot = section.querySelector<HTMLElement>(".landing-stage");
      if (!slot) return;
      const box = slot.getBoundingClientRect();
      const root = document.documentElement.style;
      const heroBox = section.getBoundingClientRect();
      root.setProperty("--hero-model-top", `${box.top - heroBox.top}px`);
      root.setProperty("--hero-model-left", `${box.left - heroBox.left}px`);
      root.setProperty("--hero-model-width", `${box.width}px`);
      root.setProperty("--hero-model-height", `${box.height}px`);
    };
    const observer = new ResizeObserver(updateModelSlot);
    observer.observe(section);
    updateModelSlot();
    let isVisible = true;
    const updateVisibility = (progress: number) => {
      const shouldBeVisible = progress < 0.12;
      if (shouldBeVisible === isVisible) return;
      isVisible = shouldBeVisible;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.to(cue, {
        autoAlpha: shouldBeVisible ? 1 : 0,
        duration: reducedMotion ? 0 : 0.18,
        overwrite: "auto",
      });
    };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => updateVisibility(self.progress),
      onRefresh: (self) => updateVisibility(self.progress),
    });
    return () => {
      observer.disconnect();
      trigger.kill();
      ["top", "left", "width", "height"].forEach((key) => document.documentElement.style.removeProperty(`--hero-model-${key}`));
      gsap.killTweensOf(cue);
    };
  }, []);

  return (
  <section className="landing-section" id="landingDiv" aria-labelledby="hero-name" ref={sectionRef}>
    <div className="landing-atmosphere" aria-hidden="true">
      <span className="landing-glow landing-glow-mint" />
      <span className="landing-glow landing-glow-lavender" />
      <span className="landing-grid-lines" />
    </div>
    <div className="landing-container">
      <div className="landing-intro">
        <p className="landing-greeting"><span />Hello, I'm</p>
        <h1 id="hero-name" aria-label="Sumit Thakur"><span className="hero-name-line"><span>SUMIT</span></span><span className="hero-name-line"><span>THAKUR</span></span></h1>
      </div>

      <div className="landing-info" role="group" aria-label="Software Developer and Full-Stack Engineer">
        <p className="landing-role-label"><span>01</span> SOFTWARE</p>
        <p className="landing-role-title">DEVELOPER</p>
        <span className="landing-role-divider" aria-hidden="true" />
        <p className="landing-role-label"><span>02</span> FULL-STACK</p>
        <p className="landing-role-title landing-role-secondary">ENGINEER</p>
      </div>
      <div className="landing-stage" aria-hidden="true"><span className="landing-stage-caption">THE DEVELOPER <i /> SUMIT THAKUR</span></div>
        <div className="landing-actions">
          <a className="hero-cta hero-cta-primary" href="#work" onClick={(event) => scrollToSection(event, "work")}>
            Explore My Work <span aria-hidden="true">↗</span>
          </a>
          <a className="hero-cta hero-cta-secondary" href="#contact" onClick={(event) => scrollToSection(event, "contact")}>
            Contact Me <span aria-hidden="true">↗</span>
          </a>
        </div>
    </div>

    <a className="landing-scroll-cue" href="#about" onClick={(event) => scrollToSection(event, "about")} ref={scrollCueRef}>
      <span>SCROLL TO EXPLORE</span><i aria-hidden="true" />
    </a>
    <SocialIcons />
    {children}
  </section>
  );
};

export default Landing;
