import { SplitText } from "gsap/SplitText";
import gsap from "gsap";
import { getSmoother } from "./smoother";

export function initialFX() {
  document.body.style.overflowY = "auto";
  getSmoother()?.paused(false);
  document.getElementsByTagName("main")[0].classList.add("main-active");
  gsap.to("body", {
    backgroundColor: "#0a0e17",
    duration: 0.5,
    delay: 1,
  });

  const landingText = new SplitText(
    [".landing-info h3", ".landing-intro h2", ".landing-intro h1"],
    {
      type: "chars,lines",
      linesClass: "split-line",
    }
  );
  gsap.fromTo(
    landingText.chars,
    { opacity: 0, y: 80, filter: "blur(5px)" },
    {
      opacity: 1,
      duration: 1.2,
      filter: "blur(0px)",
      ease: "power3.inOut",
      y: 0,
      stagger: 0.025,
      delay: 0.3,
    }
  );

  gsap.fromTo(
    ".landing-info-h2",
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      y: 0,
      delay: 0.8,
    }
  );
  gsap.fromTo(
    [".header", ".icons-section", ".nav-fade"],
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      delay: 0.1,
    }
  );

  const roleTitles = Array.from(
    document.querySelectorAll<HTMLElement>(".landing-role-title")
  );

  LoopRoleText(roleTitles);
}

function LoopRoleText(roleTitles: HTMLElement[]) {
  const transitionDuration = 0.9;
  const visibleDuration = 2.4;
  const cycleDuration = transitionDuration * 2 + visibleDuration;
  const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

  roleTitles.forEach((title, index) => {
    const start = index * cycleDuration;
    gsap.set(title, { autoAlpha: 0, y: 80 });
    timeline.to(
      title,
      {
        autoAlpha: 1,
        y: 0,
        duration: transitionDuration,
        ease: "power3.inOut",
      },
      start
    );
    timeline.to(
      title,
      {
        autoAlpha: 0,
        y: -80,
        duration: transitionDuration,
        ease: "power3.inOut",
      },
      start + transitionDuration + visibleDuration
    );
  });
}
