import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles/Career.css";

gsap.registerPlugin(ScrollTrigger);

type CareerEntry = {
  kind: "EXPERIENCE" | "EDUCATION";
  title: string;
  organization: string;
  start: string;
  startDate: string;
  end: string;
  endDate?: string;
  description: string;
  highlights?: string[];
  technologies: string[];
};

const careerEntries: CareerEntry[] = [
  {
    kind: "EXPERIENCE",
    title: "Software Development Engineer",
    organization: "M2W Reality",
    start: "October 2026",
    startDate: "2026-10",
    end: "Present",
    description:
      "Building and maintaining production-ready web applications, developing scalable features, and collaborating across frontend and backend systems to deliver reliable user experiences.",
    technologies: [],
  },
  {
    kind: "EXPERIENCE",
    title: "Software Developer",
    organization: "CD Solutions",
    start: "January 2026",
    startDate: "2026-01",
    end: "May 2026",
    endDate: "2026-05",
    description:
      "Developed scalable full-stack applications with React.js, Node.js, REST APIs, and databases.",
    highlights: [
      "Implemented automation workflows and HRMS features.",
      "Designed authentication and backend services.",
      "Debugged production issues and wrote unit and integration tests with Pytest and Playwright.",
    ],
    technologies: ["React.js", "Node.js", "REST APIs", "Databases", "Authentication", "Automation", "Pytest", "Playwright"],
  },
  {
    kind: "EXPERIENCE",
    title: "Software Development Intern",
    organization: "CD Solutions",
    start: "November 2025",
    startDate: "2025-11",
    end: "December 2025",
    endDate: "2025-12",
    description:
      "Contributed to production web applications and backend workflows using modern web technologies and REST APIs. Assisted with debugging, testing, and automation to improve application reliability.",
    technologies: ["REST APIs", "Backend Workflows", "Testing", "Automation"],
  },
  {
    kind: "EXPERIENCE",
    title: "Web Developer",
    organization: "Cosahyog Consultant and Care",
    start: "October 2024",
    startDate: "2024-10",
    end: "December 2024",
    endDate: "2024-12",
    description:
      "Developed and deployed responsive web interfaces using HTML, CSS, JavaScript, and React.js. Improved responsiveness and user engagement by 40% through optimized UI components and layouts.",
    technologies: ["HTML", "CSS", "JavaScript", "React.js"],
  },
  {
    kind: "EDUCATION",
    title: "B.Tech (AI & ML)",
    organization: "Guru Gobind Singh Indraprastha University, Delhi",
    start: "September 2023",
    startDate: "2023-09",
    end: "August 2027",
    endDate: "2027-08",
    description:
      "Pursuing a Bachelor of Technology in Artificial Intelligence & Machine Learning with a CGPA of 8.1/10.0.",
    technologies: ["Artificial Intelligence", "Machine Learning"],
  },
];

const Career = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const entryRefs = useRef<(HTMLLIElement | null)[]>([]);
  const listRef = useRef<HTMLOListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const activateEntry = (index: number) => {
    setActiveIndex((current) => current === index ? current : index);
  };

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const list = listRef.current;
    if (!list) return;
    let nodeOffsets: number[] = [];
    let railStart = 0;
    let railLength = 1;
    const measure = () => {
      const top = list.getBoundingClientRect().top;
      nodeOffsets = entryRefs.current.map(entry => {
        const node = entry?.querySelector(".career-node")?.getBoundingClientRect();
        return node ? node.top + node.height / 2 - top : 0;
      });
      railStart = nodeOffsets[0] ?? 0;
      railLength = Math.max(1, (nodeOffsets[nodeOffsets.length - 1] ?? railStart) - railStart);
      list.style.setProperty("--rail-start", `${railStart}px`);
      list.style.setProperty("--rail-length", `${railLength}px`);
    };
    const sync = (progress: number) => {
      section.style.setProperty("--career-progress", progress.toFixed(5));
      const point = railStart + progress * railLength;
      let nearest = 0;
      nodeOffsets.forEach((offset, index) => {
        if (Math.abs(offset - point) < Math.abs(nodeOffsets[nearest] - point)) nearest = index;
      });
      activateEntry(nearest);
    };
    measure();
    const context = gsap.context(() => {
      ScrollTrigger.create({
        id: "career-rail",
        trigger: list,
        start: () => `top+=${railStart} 48%`,
        end: () => `top+=${railStart + railLength} 48%`,
        invalidateOnRefresh: true,
        onRefreshInit: measure,
        onUpdate: self => sync(self.progress),
        onRefresh: self => sync(self.progress),
      });
    }, section);
    // Content is always readable. These one-time classes only add a short reveal.
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("career-entered");
        reveal.unobserve(entry.target);
      });
    }, { threshold: .12 });
    section.querySelectorAll(".career-header, .career-entry").forEach(el => reveal.observe(el));
    let resizeTimer = 0;
    let lastSize = "";
    const resize = new ResizeObserver(([entry]) => {
      const size = `${entry.contentRect.width}:${entry.contentRect.height}`;
      if (size === lastSize) return;
      lastSize = size;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(true), 120);
    });
    resize.observe(list);
    return () => {
      window.clearTimeout(resizeTimer);
      resize.disconnect(); reveal.disconnect(); context.revert();
      section.style.removeProperty("--career-progress");
    };
  }, []);

  return (
    <section
      className="career-section"
      id="career"
      aria-labelledby="career-title"
      ref={sectionRef}
    >
      <div className="career-container">
        <header className="career-header">
          <p className="career-eyebrow"><span aria-hidden="true" /> 03 / PROFESSIONAL JOURNEY</p>
          <div className="career-heading-row">
            <h2 id="career-title">THE JOURNEY<br /><span>SO FAR.</span></h2>
            <p className="career-intro">From building foundations to engineering real-world software — a journey shaped by learning, problem-solving, and practical development.</p>
          </div>
        </header>

        <div className="career-index" aria-hidden="true"><span>EXPERIENCE & EDUCATION</span><span>2023 — PRESENT</span></div>
        <ol ref={listRef} className="career-list" aria-label="Career and education, most recent start date first">
          {careerEntries.map((entry, index) => (
            <li
              className={`career-entry${activeIndex === index ? " is-active" : ""}`}
              id={`career-entry-${index + 1}`}
              key={`${entry.organization}-${entry.title}`}
              ref={(element) => { entryRefs.current[index] = element; }}
            >
              <div className="career-identity">
                <p className="career-kicker"><span>{String(index + 1).padStart(2, "0")}</span>{entry.end === "Present" ? "CURRENT EXPERIENCE" : entry.kind}</p>
                <h3 className="career-role-heading"><button
                  className="career-select"
                  type="button"
                  aria-pressed={activeIndex === index}
                  aria-label={`Select ${entry.title} at ${entry.organization}`}
                  onClick={() => activateEntry(index)}
                >
                  <span className="career-role-title">{entry.title}</span>
                  <span className="career-company">{entry.organization}</span>
                  <span className="career-direction" aria-hidden="true">↗</span>
                </button></h3>
              </div>

              <div className="career-marker" aria-hidden="true">
                <span className="career-node" />
              </div>

              <div className="career-details">
                <p className="career-dates">
                  <time dateTime={entry.startDate}>{entry.start}</time>
                  <span aria-hidden="true">—</span>
                  {entry.endDate ? <time dateTime={entry.endDate}>{entry.end}</time> : <span>{entry.end}</span>}
                </p>
                <p className="career-description">{entry.description}</p>
                {entry.highlights && (
                  <ul className="career-highlights">
                    {entry.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                  </ul>
                )}
                {entry.technologies.length > 0 && (
                  <ul className="career-tags" aria-label="Technologies and areas">
                    {entry.technologies.map((technology) => <li key={technology}>{technology}</li>)}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
        <footer className="career-ending"><span aria-hidden="true" /><p>Always building. Always learning.</p><span className="career-ending-index" aria-hidden="true">THE JOURNEY CONTINUES</span></footer>
      </div>
    </section>
  );
};

export default Career;
