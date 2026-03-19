import { ScrollSmoother } from "gsap/ScrollSmoother";

let smoother: ScrollSmoother | null = null;

export const setSmoother = (value: ScrollSmoother | null) => {
  smoother = value;
};

export const getSmoother = () => smoother;
