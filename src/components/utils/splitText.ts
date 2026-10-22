import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

export default function setSplitText(): () => void {
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (window.innerWidth < 900) return () => undefined;

  const splits: SplitText[] = [];
  const context = gsap.context(() => {
    const TriggerStart = window.innerWidth <= 1024 ? "top 60%" : "20% 60%";
    const ToggleAction = "play pause resume reverse";

    document.querySelectorAll<HTMLElement>(".para").forEach((para) => {
      para.classList.add("visible");
      const split = new SplitText(para, {
        type: "lines,words",
        linesClass: "split-line",
      });
      splits.push(split);

      gsap.fromTo(
        split.words,
        { autoAlpha: 0, y: 80 },
        {
          autoAlpha: 1,
          scrollTrigger: {
            trigger: para.parentElement?.parentElement ?? para,
            toggleActions: ToggleAction,
            start: TriggerStart,
          },
          duration: 1,
          ease: "power3.out",
          y: 0,
          stagger: 0.02,
        }
      );
    });

    document.querySelectorAll<HTMLElement>(".title").forEach((title) => {
      const split = new SplitText(title, {
        type: "chars,lines",
        linesClass: "split-line",
      });
      splits.push(split);

      gsap.fromTo(
        split.chars,
        { autoAlpha: 0, y: 80, rotate: 10 },
        {
          autoAlpha: 1,
          scrollTrigger: {
            trigger: title.parentElement?.parentElement ?? title,
            toggleActions: ToggleAction,
            start: TriggerStart,
          },
          duration: 0.8,
          ease: "power2.inOut",
          y: 0,
          rotate: 0,
          stagger: 0.03,
        }
      );
    });
  });

  return () => {
    context.revert();
    splits.reverse().forEach((split) => split.revert());
  };
}
