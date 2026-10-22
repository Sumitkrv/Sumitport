import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles/WhatIDo.css";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    id: "full-stack",
    title: ["FULL-STACK", "DEVELOPMENT"],
    subtitle: "End-to-End Web Applications",
    description:
      "Building responsive, scalable web applications with carefully engineered frontend experiences, backend services, database integrations, and secure authentication workflows.",
    capabilities: [
      "Frontend Architecture",
      "Backend Development",
      "REST API Integration",
      "Authentication & Authorization",
      "Database-Backed Applications",
      "Deployment & Optimization",
    ],
  },
  {
    id: "automation",
    title: ["AI & BUSINESS", "AUTOMATION"],
    subtitle: "Intelligent Workflows & Integrations",
    description:
      "Developing practical automation workflows and integrating intelligent capabilities into digital products to simplify repetitive operations and improve business efficiency.",
    capabilities: [
      "Workflow Automation",
      "API Integrations",
      "AI-Assisted Features",
      "Business Process Automation",
      "Data Processing",
      "Custom Automation Systems",
    ],
  },
  {
    id: "quality",
    title: ["TESTING & QUALITY", "ENGINEERING"],
    subtitle: "Reliable & Maintainable Software",
    description:
      "Improving application reliability through structured testing, debugging, integration validation, and maintainable engineering practices.",
    capabilities: [
      "Unit Testing",
      "Integration Testing",
      "API Testing",
      "UI Testing",
      "Automated Testing",
      "Debugging & Quality Assurance",
    ],
  },
  {
    id: "frontend",
    title: ["RESPONSIVE UI &", "FRONTEND ENGINEERING"],
    subtitle: "High-Quality Digital Interfaces",
    description:
      "Transforming product requirements into modern, responsive, accessible interfaces with intuitive user experiences, polished interactions, and performance-conscious frontend architecture.",
    capabilities: [
      "React Development",
      "Responsive Design",
      "UI Component Architecture",
      "Interaction Design",
      "Accessibility",
      "Frontend Optimization",
    ],
  },
] as const;

type ServiceId = (typeof services)[number]["id"];

const WhatIDo = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [expandedService, setExpandedService] = useState<ServiceId | null>("full-stack");
  const [hoveredService, setHoveredService] = useState<ServiceId | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) section.dataset.revealed = "true";
    const setStageActive = (active: boolean) => {
      if (active) {
        section.dataset.revealed = "true";
        updateModelSlot();
        document.documentElement.dataset.whatStageActive = "true";
      } else {
        delete document.documentElement.dataset.whatStageActive;
      }
    };
    const updateModelSlot = () => {
      const slot = section.querySelector<HTMLElement>(".what-model-slot");
      const landing = document.querySelector<HTMLElement>(".landing-section");
      if (!slot || !landing) return;
      const slotRect = slot.getBoundingClientRect();
      const landingRect = landing.getBoundingClientRect();
      const rootStyle = document.documentElement.style;
      rootStyle.setProperty("--what-model-top", `${slotRect.top - landingRect.top}px`);
      rootStyle.setProperty("--what-model-left", `${slotRect.left - landingRect.left}px`);
      rootStyle.setProperty("--what-model-width", `${slotRect.width}px`);
      rootStyle.setProperty("--what-model-height", `${slotRect.height}px`);
    };
    let resizeFrame = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(updateModelSlot);
    };
    window.addEventListener("resize", onResize, { passive: true });
    if (section.getBoundingClientRect().top < window.innerHeight && section.getBoundingClientRect().bottom > 0) {
      setStageActive(true);
    }
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => setStageActive(self.isActive),
      onRefresh: (self) => setStageActive(self.isActive),
    });

    return () => {
      trigger.kill();
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(resizeFrame);
      delete document.documentElement.dataset.whatStageActive;
      ["--what-model-top", "--what-model-left", "--what-model-width", "--what-model-height"]
        .forEach((property) => document.documentElement.style.removeProperty(property));
    };
  }, []);

  useEffect(() => {
    const mood = hoveredService ?? expandedService;
    if (mood) document.documentElement.dataset.whatService = mood;
    else delete document.documentElement.dataset.whatService;

    return () => {
      delete document.documentElement.dataset.whatService;
    };
  }, [expandedService, hoveredService]);

  const revealMood = (service: ServiceId) => setHoveredService(service);

  return (
    <section
      className="whatIDO"
      id="expertise"
      aria-labelledby="what-title"
      ref={sectionRef}
    >
      <div className="what-layout">
        <div className="what-left-column">
          <div className="what-stage">
            <p className="what-eyebrow"><span aria-hidden="true" /> WHAT I DO</p>
            <h2 className="what-title" id="what-title">
              WHAT<br />I <span>DO.</span>
            </h2>
            <p className="what-intro">
              I build complete digital solutions, from thoughtful interfaces to reliable systems.
            </p>
            <div className="what-stage-caption" aria-hidden="true">
              <span>DESIGN</span><i /><span>ENGINEER</span><i /><span>DELIVER</span>
            </div>
          </div>
          <div className="what-model-slot" aria-hidden="true" />
        </div>

        <div className="what-services" aria-label="Software engineering services">
          {services.map((service, index) => {
            const expanded = expandedService === service.id;
            const panelId = `service-panel-${service.id}`;
            const buttonId = `service-button-${service.id}`;

            return (
              <article
                className={`service-row${expanded ? " is-expanded" : ""}`}
                key={service.id}
                onPointerEnter={() => revealMood(service.id)}
                onPointerLeave={() => setHoveredService(null)}
                onFocusCapture={() => revealMood(service.id)}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setHoveredService(null);
                  }
                }}
              >
                <h3 className="service-heading">
                  <button
                    className="service-toggle"
                    id={buttonId}
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setExpandedService(expanded ? null : service.id)}
                  >
                    <span className="service-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="service-title">
                      {service.title.map((line) => <span key={line}>{line}</span>)}
                    </span>
                    <span className="service-icon" aria-hidden="true"><i /></span>
                  </button>
                </h3>
                <div
                  className="service-panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!expanded}
                >
                  <div className="service-panel-inner">
                    <p className="service-subtitle">{service.subtitle}</p>
                    <p className="service-description">{service.description}</p>
                    <ul className="service-capabilities" aria-label="Capabilities">
                      {service.capabilities.map((capability, capabilityIndex) => (
                        <li key={capability} style={{ "--capability-index": capabilityIndex } as React.CSSProperties}>
                          {capability}
                        </li>
                      ))}
                    </ul>
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
