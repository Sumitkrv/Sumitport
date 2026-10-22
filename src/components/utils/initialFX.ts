import gsap from "gsap";

// The existing loading provider calls this once after exit. No loader or
// scrolling state is owned here; semantic text is visible before initialization.
export function initialFX() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => undefined;
  const context = gsap.context(() => {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .fromTo(".landing-atmosphere", { opacity: .35 }, { opacity: 1, duration: .8 }, 0)
      .fromTo(".landing-greeting", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .4 }, .1)
      .fromTo(".hero-name-line > span", { yPercent: 105 }, { yPercent: 0, duration: .8, stagger: .1 }, .2)
      .fromTo(".landing-info > p", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .55, stagger: .06 }, .55)
      .fromTo(".landing-actions", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .5 }, .9)
      .fromTo(".landing-scroll-cue, .landing-section .icons-section, .landing-stage-caption", { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, 1.05);
  });
  return () => context.revert();
}
