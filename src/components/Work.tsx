import { useState, useCallback } from "react";
import "./styles/Work.css";
import WorkImage from "./WorkImage";
import { MdArrowBack, MdArrowForward } from "react-icons/md";

type Project = {
  title: string;
  category: string;
  tools: string;
  description: string;
  features?: string;
  image?: string;
  link?: string;
};

const projects: Project[] = [
  {
    title: "StaffSphere",
    category: "HR Management System",
    tools: "React.js, Flask, REST APIs, MongoDB, JWT, Redis",
    description:
      "Full-stack HR management system covering employee management, attendance, leave, payroll, and administration.",
    features:
      "Role-based access control, JWT authentication, five+ workflows, Vitest and Pytest testing",
    image: "/images/staffsphere.jpg",
    link: "https://staff-sphere-smoky.vercel.app/#/admin",
  },
  {
    title: "Telemedicine Platform",
    category: "Healthcare Web Application",
    tools: "Node.js, Express, Socket.io, PeerJS, JavaScript",
    description:
      "Telemedicine platform for appointments, video consultations, electronic health records, pharmacy, lab tests, and symptom mapping.",
    features:
      "Real-time communication, responsive consultation interfaces, Playwright end-to-end testing",
    image: "/images/telemedicine-platform.jpg",
    link: "https://brilliant-cascaron-c57211.netlify.app/",
  },
  {
    title: "PR Sparkz",
    category: "Business Website",
    tools: "React.js, Tailwind CSS, JavaScript",
    description:
      "Responsive business website developed and deployed with a focus on clear navigation and accessible interfaces.",
    features:
      "Responsive layouts, accessibility improvements, frontend performance, cross-device compatibility",
    image: "/images/pr-sparkz.jpg",
    link: "https://www.prsparkz.com/",
  },
  {
    title: "MIET Life",
    category: "Consultation Platform",
    tools: "Website",
    description: "Consultation Platform",
    image: undefined,
    link: "https://miet.life/en",
  },
  {
    title: "Sahyog Care For You",
    category: "Delhi-based NGO",
    tools: "Website",
    description: "Delhi-based NGO",
    image: "/images/sahyog-care-for-you.jpg",
    link: "https://www.sahyogcare4u.org/",
  },
  {
    title: "AI Vidya",
    category: "Odisha Government Project",
    tools: "Website",
    description: "Odisha Government Project",
    image: "/images/ai-vidya.jpg",
    link: "https://aividya-eight.vercel.app/",
  },
  {
    title: "Vibhu Kitchen",
    category: "Commercial Kitchen Equipment Manufacturer",
    tools: "Website",
    description: "Commercial Kitchen Equipment Manufacturer",
    image: undefined,
    link: "https://www.vibhukitchen.in/",
  },
  {
    title: "CD Hydro",
    category: "Hydropower Solutions Company",
    tools: "Website",
    description: "Hydropower Solutions Company",
    image: undefined,
    link: "https://cd-hydro.vercel.app/",
  },
  {
    title: "BK Sikha",
    category: "Yoga Instructor Website",
    tools: "Website",
    description: "Yoga Instructor Website",
    image: "/images/bk-shikha.jpg",
    link: "https://bk-sikha.vercel.app/",
  },
  {
    title: "CDEV EV",
    category: "Electric Vehicle Manufacturer",
    tools: "Website",
    description: "Electric Vehicle Manufacturer",
    image: "/images/cdev-ev.jpg",
    link: "https://cdevnew.vercel.app/",
  },
  {
    title: "CD IT",
    category: "IT Service Provider",
    tools: "Website",
    description: "IT Service Provider",
    image: "/images/cd-it.jpg",
    link: "https://cd-it-ten.vercel.app/",
  },
  {
    title: "Mama Giggles",
    category: "Maternal & Women's Healthcare Platform",
    tools: "Website",
    description:
      "Healthcare platform supporting mothers through pregnancy, self-care, appointments, and trusted gynecology guidance.",
    features:
      "Pregnancy wellness resources, appointment scheduling, nearby gynecologist discovery, multilingual access",
    image: "/images/healthcare-website.jpg",
    link: "https://incandescent-sopapillas-507acc.netlify.app/",
  },
  {
    title: "Safar Hamara",
    category: "Travel Platform",
    tools: "Website",
    description: "Travel Platform",
    image: "/images/safar-hamara.jpg",
    link: "https://www.safarhamara.com/",
  },
  {
    title: "Portfolio Website",
    category: "Personal Brand & Showcase",
    tools: "React.js, TypeScript, Vite, Three.js",
    description: "Animated developer portfolio with responsive layouts and interactive 3D experiences.",
    features: "GSAP motion, Three.js, responsive UI, accessible navigation",
    image: "/images/portfolio-website.jpg",
    link: "https://sumitport.vercel.app/",
  },
];

const Work = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating || index === currentIndex || index < 0 || index >= projects.length) {
        return;
      }
      setIsAnimating(true);
      setCurrentIndex(index);
    },
    [currentIndex, isAnimating]
  );

  const goToPrev = useCallback(() => {
    const newIndex =
      currentIndex === 0 ? projects.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex =
      currentIndex === projects.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>

        <div className="carousel-wrapper">
          {/* Navigation Arrows */}
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={goToPrev}
            aria-label="Previous project"
            data-cursor="disable"
          >
            <MdArrowBack />
          </button>
          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={goToNext}
            aria-label="Next project"
            data-cursor="disable"
          >
            <MdArrowForward />
          </button>

          {/* Slides */}
          <div className="carousel-track-container">
            <div
              className="carousel-track"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
              onTransitionEnd={() => setIsAnimating(false)}
            >
              {projects.map((project, index) => (
                <div className="carousel-slide" key={project.title}>
                  <div className="carousel-content">
                    <div className="carousel-info">
                      <div className="carousel-number" aria-hidden="true">
                          <h3>{String(index + 1).padStart(2, "0")}</h3>
                      </div>
                      <div className="carousel-details">
                        <h4>{project.title}</h4>
                        <p className="carousel-category">
                          {project.category}
                        </p>
                        <div className="carousel-tools">
                          <span className="tools-label">Tools & Features</span>
                          <p>{project.tools}</p>
                          {project.description && (
                            <p className="carousel-description">
                              {project.description}
                            </p>
                          )}
                          {project.features && (
                            <p className="carousel-features">{project.features}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="carousel-image-wrapper">
                      <WorkImage
                        image={project.image}
                        alt={project.title}
                        link={project.link}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="carousel-dots">
            {projects.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? "carousel-dot-active" : ""
                  }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to project ${index + 1}`}
                data-cursor="disable"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;
