import gsap from "gsap";

// GSAP owns only document presentation. Camera/model transforms belong to the
// character presentation controller and cannot be captured by later timelines.
export function setHeroContentTimeline() {
  const media = gsap.matchMedia();
  media.add("(min-width: 1025px)", () => {
    gsap.timeline({ scrollTrigger: {
      trigger: ".landing-section", start: "top top", end: "bottom top", scrub: true,
    } })
      .fromTo(".landing-container", { opacity: 1, y: "0%" }, { opacity: 0, duration: .45 }, .45)
      .to(".landing-container", { y: "-10%", duration: .8 }, .15);
  });
  return () => media.revert();
}
