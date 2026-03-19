import { ScrollSmoother } from "gsap-trial/ScrollSmoother";

let smoother: ScrollSmoother | null = null;

export const setSmoother = (value: ScrollSmoother | null) => {
  smoother = value;
};

export const getSmoother = () => smoother;
