import { MouseEvent, PropsWithChildren, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getSmoother } from "./utils/smoother";
import "./styles/Landing.css";

gsap.registerPlugin(ScrollTrigger);

const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  const smoother = getSmoother();
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (smoother) smoother.scrollTo(target, smooth, "top 100px");
  else {
    const top = target.getBoundingClientRect().top + window.scrollY - 92;
    window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
  }
  window.history.replaceState(null, "", `#${id}`);
};

const Landing = ({ children }: PropsWithChildren) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollCueRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const cue = scrollCueRef.current;
    if (!section || !cue) return;

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
      trigger.kill();
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
        <h1 id="hero-name"><span>SUMIT</span><span>THAKUR</span></h1>
        <div className="landing-actions">
          <a className="hero-cta hero-cta-primary" href="#work" onClick={(event) => scrollToSection(event, "work")}>
            Explore My Work <span aria-hidden="true">↗</span>
          </a>
          <a className="hero-cta hero-cta-secondary" href="mailto:thakursumi498@gmail.com">
            Contact Me <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className="landing-info" role="group" aria-label="Software Developer and Full-Stack Engineer">
        <p className="landing-role-label"><span>01</span> SOFTWARE</p>
        <p className="landing-role-title">DEVELOPER</p>
        <span className="landing-role-divider" aria-hidden="true" />
        <p className="landing-role-label"><span>02</span> FULL-STACK</p>
        <p className="landing-role-title landing-role-secondary">ENGINEER</p>
      </div>
    </div>

    <a className="landing-scroll-cue" href="#about" onClick={(event) => scrollToSection(event, "about")} ref={scrollCueRef}>
      <span>SCROLL TO EXPLORE</span><i aria-hidden="true" />
    </a>
    {children}
  </section>
  );
};

export default Landing;
