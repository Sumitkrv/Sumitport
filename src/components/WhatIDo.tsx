import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SceneBoundary from "./SceneBoundary";
import { getSmoother } from "./utils/smoother";
import "./styles/WhatIDo.css";

const WorkstationScene = lazy(() => import("./Workstation/WorkstationScene"));

const services = [
  {
    id: "full-stack",
    title: ["FULL-STACK", "DEVELOPMENT"],
    subtitle: "End-to-End Web Applications",
    description: "Building modern full-stack applications with responsive frontend interfaces, reliable backend services, database integrations and secure authentication workflows.",
    capabilities: ["React Development", "Backend Development", "REST APIs", "Authentication", "Database Integration", "Deployment"],
  },
  {
    id: "automation",
    title: ["AI & BUSINESS", "AUTOMATION"],
    subtitle: "Intelligent Workflows & Integrations",
    description: "Designing practical automation workflows and integrating intelligent capabilities into digital products to simplify business operations.",
    capabilities: ["Workflow Automation", "API Integrations", "HRMS Workflows", "Business Processes", "Data Processing"],
  },
  {
    id: "quality",
    title: ["TESTING & QUALITY", "ENGINEERING"],
    subtitle: "Reliable, Maintainable Software",
    description: "Improving application reliability through structured testing, debugging, automation and consistent quality-engineering practices.",
    capabilities: ["Unit Testing", "Integration Testing", "API Testing", "Pytest", "Playwright", "Test Automation"],
  },
  {
    id: "frontend",
    title: ["RESPONSIVE UI &", "FRONTEND ENGINEERING"],
    subtitle: "Thoughtful Digital Interfaces",
    description: "Developing accessible, responsive and high-performance user interfaces with polished interactions and maintainable frontend architecture.",
    capabilities: ["React", "TypeScript", "Responsive Design", "UI Components", "Accessibility", "Frontend Optimization"],
  },
] as const;

type ServiceId = (typeof services)[number]["id"];

const WhatIDo = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const readingAnchor = useRef<{ button: HTMLButtonElement; top: number } | null>(null);
  const [sceneRequested, setSceneRequested] = useState(false);
  const [expandedService, setExpandedService] = useState<ServiceId | null>("full-stack");
  const [hoveredService, setHoveredService] = useState<ServiceId | null>(null);
  const mood = hoveredService ?? expandedService ?? "full-stack";

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    const reveal = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        section.dataset.revealed = "true";
        reveal.disconnect();
      }
    }, { threshold: .05 });
    reveal.observe(section);
    const requestScene = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSceneRequested(true);
        requestScene.disconnect();
      }
    }, { rootMargin: "400px 0px" });
    requestScene.observe(stage);

    // Let the existing scroll system measure real, intrinsic panel heights.
    // Debouncing waits for the accordion transition instead of refreshing each frame.
    let refreshTimer = 0;
    let lastHeight = section.getBoundingClientRect().height;
    const sizeObserver = new ResizeObserver(([entry]) => {
      const height = entry.contentRect.height;
      if (Math.abs(height - lastHeight) < 1) return;
      lastHeight = height;
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(true), 160);
    });
    sizeObserver.observe(section);
    return () => {
      reveal.disconnect();
      requestScene.disconnect();
      sizeObserver.disconnect();
      window.clearTimeout(refreshTimer);
    };
  }, []);

  useLayoutEffect(() => {
    const anchor = readingAnchor.current;
    readingAnchor.current = null;
    if (!anchor) return;
    let frame = 0;
    let cancelled = false;
    const started = performance.now();
    const cancel = () => { cancelled = true; cancelAnimationFrame(frame); };
    const preserveHeading = () => {
      if (cancelled || !anchor.button.isConnected) return;
      const delta = anchor.button.getBoundingClientRect().top - anchor.top;
      if (Math.abs(delta) > .5) {
        const smoother = getSmoother();
        if (smoother) smoother.scrollTop(smoother.scrollTop() + delta);
        else window.scrollBy(0, delta);
      }
      const elapsed = performance.now() - started;
      const moving = sectionRef.current?.getAnimations({ subtree: true }).some((animation) => animation.playState === "running");
      if (elapsed < 650 || (moving && elapsed < 2000)) frame = requestAnimationFrame(preserveHeading);
    };
    frame = requestAnimationFrame(preserveHeading);
    // A reader's wheel, touch or next key always takes precedence.
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("pointerdown", cancel, { passive: true });
    window.addEventListener("keydown", cancel);
    return () => {
      cancel();
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("pointerdown", cancel);
      window.removeEventListener("keydown", cancel);
    };
  }, [expandedService]);

  const toggleService = (service: ServiceId, button: HTMLButtonElement) => {
    const previous = services.findIndex((entry) => entry.id === expandedService);
    const next = services.findIndex((entry) => entry.id === service);
    const previousPanel = sectionRef.current?.querySelector<HTMLElement>(".service-row.is-expanded .service-panel");
    const top = button.getBoundingClientRect().top;
    // Only compensate when closing an earlier panel would move the selected
    // heading behind the navbar. Other rows retain their natural movement.
    if (expandedService !== service && previous >= 0 && previous < next &&
      top - (previousPanel?.getBoundingClientRect().height ?? 0) < 96) {
      readingAnchor.current = { button, top };
    }
    setExpandedService(expandedService === service ? null : service);
  };

  const navigateServices = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const buttons = sectionRef.current?.querySelectorAll<HTMLButtonElement>(".service-toggle");
    if (!buttons) return;
    const next = event.key === "ArrowDown" ? (index + 1) % services.length
      : event.key === "ArrowUp" ? (index + services.length - 1) % services.length
        : event.key === "Home" ? 0 : event.key === "End" ? services.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    buttons[next]?.focus();
  };

  return (
    <section className="whatIDO" id="expertise" aria-labelledby="what-title" ref={sectionRef} data-service={mood}>
      <div className="what-layout">
        <div className="what-left-column">
          <header className="what-stage">
            <p className="what-eyebrow"><span aria-hidden="true" />02 / ENGINEERING EXPERTISE</p>
            <h2 className="what-title" id="what-title">WHAT<br />I <span>DO.</span></h2>
            <p className="what-intro">I build complete digital solutions, from thoughtful interfaces to reliable systems.</p>
          </header>
          <figure className="what-workstation">
            <div className="what-model-slot" ref={stageRef} aria-hidden="true">
              {sceneRequested && <SceneBoundary fallback={<img className="workstation-fallback" src="/images/workstation-fallback.png" alt="" />}>
                <Suspense fallback={null}><WorkstationScene service={mood} /></Suspense>
              </SceneBoundary>}
            </div>
            <figcaption className="what-stage-caption"><span>DESIGN</span><i aria-hidden="true" /><span>ENGINEER</span><i aria-hidden="true" /><span>DELIVER</span></figcaption>
          </figure>
        </div>

        <div className="what-services" aria-label="Software engineering capabilities">
          <div className="what-services-label" aria-hidden="true"><span>THE CAPABILITY INDEX</span><span>01 — 04</span></div>
          {services.map((service, index) => {
            const expanded = expandedService === service.id;
            const panelId = `service-panel-${service.id}`;
            const buttonId = `service-button-${service.id}`;
            return (
              <article className={`service-row${expanded ? " is-expanded" : ""}`} key={service.id}
                onPointerEnter={() => setHoveredService(service.id)}
                onPointerLeave={() => setHoveredService(null)}
                onFocusCapture={() => setHoveredService(service.id)}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHoveredService(null);
                }}>
                <h3 className="service-heading">
                  <button className="service-toggle" id={buttonId} type="button" aria-expanded={expanded} aria-controls={panelId}
                    onKeyDown={(event) => navigateServices(event, index)}
                    onClick={(event) => toggleService(service.id, event.currentTarget)}>
                    <span className="service-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="service-title">{service.title.map((line) => <span key={line}>{line}</span>)}</span>
                    <span className="service-icon" aria-hidden="true" />
                  </button>
                </h3>
                <div className="service-panel" id={panelId} role="region" aria-labelledby={buttonId} aria-hidden={!expanded}>
                  <div className="service-panel-inner">
                    <div className="service-panel-content">
                      <p className="service-subtitle">{service.subtitle}</p>
                      <p className="service-description">{service.description}</p>
                      <ul className="service-capabilities" aria-label="Capabilities">
                        {service.capabilities.map((capability, capabilityIndex) => (
                          <li key={capability} style={{ "--capability-index": capabilityIndex } as CSSProperties}>{capability}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhatIDo;
