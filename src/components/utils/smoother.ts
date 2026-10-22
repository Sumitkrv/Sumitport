import { ScrollSmoother } from "gsap/ScrollSmoother";

let smoother: ScrollSmoother | null = null;
const scrollLocks = new Set<"loading" | "menu">();
let previousOverflow = "";

export const setSmoother = (value: ScrollSmoother | null) => {
  smoother = value;
  smoother?.paused(scrollLocks.size > 0);
};

export const getSmoother = () => smoother;

// Loading and the menu share one lock so one cannot unlock the other.
export const setScrollLocked = (owner: "loading" | "menu", locked: boolean) => {
  if (locked && scrollLocks.size === 0) previousOverflow = document.body.style.overflowY;
  if (locked) scrollLocks.add(owner);
  else scrollLocks.delete(owner);
  document.body.style.overflowY = scrollLocks.size ? "hidden" : previousOverflow;
  smoother?.paused(scrollLocks.size > 0);
};

export const getScrollOffset = () =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scroll-offset")) || 100;

export const scrollToSection = (id: string, smooth = true) => {
  const target = document.getElementById(id);
  if (!target) return false;
  const animate = smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const offset = id === "landingDiv" ? 0 : getScrollOffset();
  if (smoother) smoother.scrollTo(target, animate, `top ${offset}px`);
  else window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset), behavior: animate ? "smooth" : "instant" });
  return true;
};
