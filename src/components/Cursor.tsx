import { useEffect, useRef } from "react";
import "./styles/Cursor.css";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const cursor = cursorRef.current;
    if (
      !cursor ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;
    let hovering = false;
    let hasPointerPosition = false;
    let frame = 0;
    const mousePos = { x: 0, y: 0 };
    const cursorPos = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      if (!hasPointerPosition) {
        cursorPos.x = e.clientX;
        cursorPos.y = e.clientY;
        hasPointerPosition = true;
        cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      cursor.classList.add("cursor-visible");
    };
    const loop = () => {
      if (!hovering) {
        cursorPos.x += (mousePos.x - cursorPos.x) / 7;
        cursorPos.y += (mousePos.y - cursorPos.y) / 7;
        cursor.style.transform = `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`;
      }
      frame = requestAnimationFrame(loop);
    };
    document.addEventListener("mousemove", onMouseMove, { passive: true });
    frame = requestAnimationFrame(loop);
    const handlers: Array<{ element: HTMLElement; enter: () => void; leave: () => void }> = [];
    document.querySelectorAll("[data-cursor]").forEach((item) => {
      const element = item as HTMLElement;
      const enter = () => {
        if (element.dataset.cursor === "icons") {
          cursor.classList.add("cursor-icons");
          const rect = element.getBoundingClientRect();
          cursor.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
          cursor.style.setProperty("--cursorH", `${rect.height}px`);
          hovering = true;
        }
        if (element.dataset.cursor === "disable") {
          cursor.classList.add("cursor-disable");
        }
      };
      const leave = () => {
        cursor.classList.remove("cursor-disable", "cursor-icons");
        hovering = false;
      };
      element.addEventListener("pointerenter", enter);
      element.addEventListener("pointerleave", leave);
      handlers.push({ element, enter, leave });
    });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("mousemove", onMouseMove);
      handlers.forEach(({ element, enter, leave }) => {
        element.removeEventListener("pointerenter", enter);
        element.removeEventListener("pointerleave", leave);
      });
    };
  }, []);

  return <div className="cursor-main" ref={cursorRef}></div>;
};

export default Cursor;
