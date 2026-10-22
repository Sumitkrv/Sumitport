import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { gsap } from "gsap";
import HoverLinks from "./HoverLinks";
import { getScrollOffset, scrollToSection, setScrollLocked, setSmoother } from "./utils/smoother";
import "./styles/Navbar.css";
import { useLoading } from "../context/loadingContext";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

const links = [
  { id: "about", label: "ABOUT" },
  { id: "work", label: "WORK" },
  { id: "achievements", label: "ACHIEVEMENTS" },
  { id: "skills", label: "SKILLS" },
  { id: "contact", label: "CONTACT" },
];

const Navbar = () => {
  const { isLoading } = useLoading();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let smoother: ScrollSmoother | null = null;
    try {
      smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: reducedMotion ? 0 : 1.1,
        smoothTouch: 0,
        effects: true,
        autoResize: true,
        ignoreMobileResize: true,
      });
      setSmoother(smoother);
    } catch {
      setSmoother(null);
    }

    const updateNavigation = () => {
      const offset = getScrollOffset() + 1;
      const active = links.find(({ id }) => {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        return rect && rect.top <= offset && rect.bottom > offset;
      });
      const atBottom = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      setActiveSection(atBottom ? "contact" : active?.id ?? "");
      setScrolled((smoother?.scrollTop() ?? window.scrollY) > 24);
    };
    const navigationTrigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: updateNavigation,
      onRefresh: updateNavigation,
    });
    updateNavigation();
    let refreshFrame = 0;
    const onResize = () => {
      cancelAnimationFrame(refreshFrame);
      if (window.innerWidth >= 720) setMenuOpen(false);
      refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    window.addEventListener("resize", onResize);

    return () => {
      navigationTrigger.kill();
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(refreshFrame);
      smoother?.kill();
      setSmoother(null);
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;
    let cancelled = false;
    let frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      scrollToSection(window.location.hash.slice(1), false);
    });
    const restoreHash = () => scrollToSection(window.location.hash.slice(1), false);
    window.addEventListener("hashchange", restoreHash);
    void document.fonts.ready.then(() => {
      if (!cancelled) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          restoreHash();
        });
      }
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", restoreHash);
    };
  }, [isLoading]);

  useEffect(() => {
    if (!menuOpen) return;
    const menuButton = menuButtonRef.current;
    setScrollLocked("menu", true);
    const background = Array.from(document.querySelectorAll<HTMLElement>("#smooth-wrapper, .header, .icons-section"));
    const previousInert = background.map((element) => element.inert);
    background.forEach((element) => { element.inert = true; });
    let focusFrame = requestAnimationFrame(() => {
      focusFrame = requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true }));
    });
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      setScrollLocked("menu", false);
      background.forEach((element, index) => { element.inert = previousInert[index]; });
      menuButton?.focus();
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    // Release the menu lock before asking ScrollSmoother to navigate.
    setScrollLocked("menu", false);
    if (menuOpen) ScrollTrigger.refresh();
    scrollToSection(id);
    window.history.replaceState(null, "", `#${id}`);
    if (menuOpen) {
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }
  };

  const trapMenuFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab" || !menuRef.current) return;
    const items = Array.from(menuRef.current.querySelectorAll<HTMLElement>("a, button"));
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  return (
    <>
      <header className={`header${scrolled ? " header-scrolled" : ""}`}>
        <a href="#landingDiv" className="navbar-title" aria-label="Sumit Thakur, home" onClick={(event) => navigate(event, "landingDiv")}>ST</a>
        <a href="mailto:thakursumi498@gmail.com" className="navbar-connect">thakursumi498@gmail.com</a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <ul>{links.map(({ id, label }) => <li key={id}><a className={activeSection === id ? "active" : ""} href={`#${id}`} onClick={(event) => navigate(event, id)} aria-current={activeSection === id ? "location" : undefined}><HoverLinks text={label} /></a></li>)}</ul>
        </nav>
        <button ref={menuButtonRef} className={`menu-toggle${menuOpen ? " menu-toggle-open" : ""}`} type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
          <span /><span />
        </button>
      </header>
      <nav id="mobile-navigation" ref={menuRef} className={`mobile-nav${menuOpen ? " mobile-nav-open" : ""}`} aria-label="Mobile navigation" aria-modal={menuOpen || undefined} role={menuOpen ? "dialog" : undefined} aria-hidden={!menuOpen} onKeyDown={trapMenuFocus}>
        <div className="mobile-nav-top"><span>SUMIT THAKUR</span><button type="button" onClick={() => { setMenuOpen(false); menuButtonRef.current?.focus(); }} aria-label="Close navigation menu">CLOSE <span aria-hidden="true">×</span></button></div>
        <ul>{links.map(({ id, label }, index) => <li key={id} style={{ "--menu-index": index } as React.CSSProperties}><a href={`#${id}`} onClick={(event) => navigate(event, id)}>{label}<span aria-hidden="true">↗</span></a></li>)}</ul>
        <a className="mobile-nav-email" href="mailto:thakursumi498@gmail.com">thakursumi498@gmail.com</a>
      </nav>
      <div className="landing-circle1" aria-hidden="true" />
      <div className="landing-circle2" aria-hidden="true" />
      <div className="nav-fade" aria-hidden="true" />
    </>
  );
};

export default Navbar;
