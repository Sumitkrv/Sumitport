import { useEffect, useRef } from "react";
import "./styles/WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const services = [
  {
    title: "FULL-STACK DEVELOPMENT",
    subtitle: "Building Scalable Web Applications",
    description:
      "Building responsive web applications using React.js, Node.js, Flask, and REST APIs. Developing frontend interfaces, backend services, authentication workflows, and database integrations with a focus on performance and reliability.",
    skills: [
      "React.js",
      "JavaScript",
      "Node.js",
      "Flask",
      "FastAPI",
      "REST APIs",
      "MongoDB",
      "PostgreSQL",
      "JWT",
    ],
  },
  {
    title: "AI & BUSINESS AUTOMATION",
    subtitle: "Intelligent Integrations and Workflow Automation",
    description:
      "Integrating AI capabilities and building automation workflows that reduce repetitive manual operations and improve business processes. Developing practical software solutions tailored to application and business requirements.",
    skills: ["Python", "AI Integration", "Business Automation", "API Integration"],
  },
  {
    title: "TESTING & QUALITY ENGINEERING",
    subtitle: "Reliable and Maintainable Software",
    description:
      "Testing application workflows, debugging production issues, and improving software reliability through unit testing, integration testing, functional testing, and end-to-end automation.",
    skills: [
      "Pytest",
      "Vitest",
      "Playwright",
      "Unit Testing",
      "Integration Testing",
      "Functional Testing",
      "Test Automation",
    ],
  },
  {
    title: "RESPONSIVE UI & FRONTEND ENGINEERING",
    subtitle: "Accessible, Responsive User Experiences",
    description:
      "Developing responsive business websites and frontend interfaces using modern web technologies. Improving layouts, navigation, accessibility, and frontend performance across desktop, tablet, and mobile devices.",
    skills: [
      "React.js",
      "HTML5",
      "CSS3",
      "JavaScript",
      "Tailwind CSS",
      "Vite",
      "Responsive Design",
    ],
  },
];

const WhatIDo = () => {
  const containerRef = useRef<(HTMLDivElement | null)[]>([]);
  const clickHandlersRef = useRef(new Map<HTMLDivElement, EventListener>());

  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };

  useEffect(() => {
    const containers = [...containerRef.current];
    const clickHandlers = clickHandlersRef.current;

    if (ScrollTrigger.isTouch) {
      containers.forEach((container) => {
        if (container) {
          container.classList.remove("what-noTouch");
          const handler: EventListener = () => handleClick(container);
          clickHandlers.set(container, handler);
          container.addEventListener("click", handler);
        }
      });
    }

    return () => {
      containers.forEach((container) => {
        if (container) {
          const handler = clickHandlers.get(container);
          if (handler) {
            container.removeEventListener("click", handler);
            clickHandlers.delete(container);
          }
        }
      });
    };
  }, []);
  return (
    <div className="whatIDO">
      <div className="what-box">
        <h2 className="title">
          W<span className="hat-h2">HAT</span>
          <div>
            I<span className="do-h2"> DO</span>
          </div>
        </h2>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          <div className="what-border2">
            <svg width="100%">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
              <line
                x1="100%"
                y1="0"
                x2="100%"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
            </svg>
          </div>
          {services.map((service, index) => (
            <div
              className="what-content what-noTouch"
              ref={(el) => setRef(el, index)}
              key={service.title}
            >
              <div className="what-border1">
                <svg height="100%">
                  <line
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="0"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="6,6"
                  />
                  <line
                    x1="0"
                    y1="100%"
                    x2="100%"
                    y2="100%"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="6,6"
                  />
                </svg>
              </div>
              <div className="what-corner"></div>

              <div className="what-content-in">
                <h3>{service.title}</h3>
                <h4>{service.subtitle}</h4>
                <p>{service.description}</p>
                <h5>Skillset & tools</h5>
                <div className="what-content-flex">
                  {service.skills.map((skill) => (
                    <div className="what-tags" key={skill}>
                      {skill}
                    </div>
                  ))}
                </div>
                <div className="what-arrow"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;

function handleClick(container: HTMLDivElement) {
  container.classList.toggle("what-content-active");
  container.classList.remove("what-sibling");
  if (container.parentElement) {
    const siblings = Array.from(container.parentElement.children);

    siblings.forEach((sibling) => {
      if (sibling !== container) {
        sibling.classList.remove("what-content-active");
        sibling.classList.toggle("what-sibling");
      }
    });
  }
}
