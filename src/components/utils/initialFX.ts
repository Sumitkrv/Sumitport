import { SplitText } from "gsap/SplitText";
import gsap from "gsap";
import { getSmoother } from "./smoother";

export function initialFX() {
  document.body.style.overflowY = "auto";
  getSmoother()?.paused(false);
  document.getElementsByTagName("main")[0]?.classList.add("main-active");

  const entryElements = [
    ".landing-greeting",
    ".landing-info",
    ".landing-actions",
    ".landing-scroll-cue",
    ".header",
    ".nav-fade",
  ];
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set([".landing-intro h1 span", ...entryElements], { clearProps: "all", autoAlpha: 1 });
    return;
  }

  gsap.to("body", { backgroundColor: "#080b13", duration: 0.5 });
  const landingText = new SplitText(".landing-intro h1", {
    type: "chars,lines",
    linesClass: "split-line",
  });
  const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
  entrance
    .fromTo(".landing-greeting", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .5 })
    .fromTo(landingText.chars, { autoAlpha: 0, y: 48, filter: "blur(5px)" }, {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
      duration: .75,
      stagger: .022,
      ease: "power3.inOut",
    }, "-=.12")
    .fromTo(".landing-info", { autoAlpha: 0, x: 18 }, { autoAlpha: 1, x: 0, duration: .7 }, "-=.36")
    .fromTo(".landing-actions", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .45 }, "-=.2")
    .fromTo(".landing-scroll-cue", { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 }, "-=.1")
    .fromTo([".header", ".nav-fade"], { autoAlpha: 0 }, { autoAlpha: 1, duration: .65, stagger: .04 }, 0);
}
