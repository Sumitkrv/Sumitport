import { CSSProperties, MouseEvent, useEffect, useRef } from "react";
import { scrollToSection as navigateToSection } from "./utils/smoother";
import "./styles/About.css";
import AboutPortrait from "./Character/AboutPortrait";

const focusAreas = [
  {
    number: "01",
    title: "Build",
    description: "Responsive interfaces and scalable full-stack applications.",
  },
  {
    number: "02",
    title: "Engineer",
    description: "REST APIs, authentication, and reliable database-backed systems.",
  },
  {
    number: "03",
    title: "Automate",
    description: "Practical workflows and integrations that reduce repetitive work.",
  },
];

const About = () => {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    section.classList.add("about-section--ready");
    if (!("IntersectionObserver" in window)) {
      section.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        section.classList.add("is-visible");
        observer.disconnect();
      },
      { threshold: 0.16 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const scrollToContact = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("contact");
    if (!target) return;

    event.preventDefault();
    navigateToSection("contact");
    window.history.replaceState(null, "", "#contact");
  };

  return (
    <section
      className="about-section"
      id="about"
      ref={sectionRef}
      aria-labelledby="about-heading"
    >
      <AboutPortrait />
      <div className="about-me">
        <p className="about-eyebrow about-reveal" style={{ "--reveal-index": 0 } as CSSProperties}>
          <span className="about-eyebrow-line" />
          01 / THE PERSON BEHIND THE CODE
        </p>

        <h2 className="about-heading about-reveal" id="about-heading" style={{ "--reveal-index": 1 } as CSSProperties}>
          More than code.
          <br />
          I build <span>experiences.</span>
        </h2>

        <div className="about-story about-reveal" style={{ "--reveal-index": 2 } as CSSProperties}>
          <p>
            I’m Sumit, a software developer focused on turning complex problems
            into intuitive digital products. I work across frontend interfaces,
            backend systems, and automation workflows—bringing ideas from concept
            to functional applications.
          </p>
          <p>
            My work spans responsive applications, REST APIs, authentication,
            testing, and production deployments, with a focus on usability,
            reliability, and performance.
          </p>
        </div>

        <ol className="about-focus-list" aria-label="My focus areas">
          {focusAreas.map((area, index) => (
            <li
              className="about-focus-row about-reveal"
              key={area.number}
              style={{ "--reveal-index": index + 3 } as CSSProperties}
            >
              <span className="about-focus-number">{area.number}</span>
              <div className="about-focus-copy">
                <h3>{area.title}</h3>
                <p>{area.description}</p>
              </div>
              <span className="about-focus-arrow" aria-hidden="true">↗</span>
            </li>
          ))}
        </ol>

        <div className="about-signature about-reveal" style={{ "--reveal-index": 6 } as CSSProperties}>
          <div className="about-identity">
            <p className="about-name">SUMIT THAKUR</p>
            <p className="about-role">Software Developer <span>/</span> Full-Stack Developer</p>
            <p className="about-location"><span aria-hidden="true">⌖</span> Delhi NCR, India</p>
          </div>
          <a className="about-contact-link" href="#contact" onClick={scrollToContact}>
            Let’s talk <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default About;
