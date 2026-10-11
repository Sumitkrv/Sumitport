import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Software Development Engineer</h4>
                <h5>M2W Reality</h5>
              </div>
              <h3>Oct 2026 – Present</h3>
            </div>
            <p>
              Building and maintaining production-ready web applications,
              developing scalable features, and collaborating across frontend
              and backend systems to deliver reliable user experiences.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Software Developer</h4>
                <h5>CD Solutions</h5>
              </div>
              <h3>Jan 2026 – May 2026</h3>
            </div>
            <p>
              Developed scalable full-stack applications with React.js, Node.js,
              REST APIs, and databases. Implemented automation workflows and HRMS
              features, designed authentication and backend services, debugged
              production issues, and wrote unit and integration tests with Pytest
              and Playwright.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Software Development Intern</h4>
                <h5>CD Solutions</h5>
              </div>
              <h3>Nov 2025 – Dec 2025</h3>
            </div>
            <p>
              Contributed to production web applications and backend workflows
              using modern web technologies and REST APIs. Assisted with
              debugging, testing, and automation to improve application
              reliability.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Web Developer</h4>
                <h5>Cosahyog Consultant and Care</h5>
              </div>
              <h3>Oct 2024 – Dec 2024</h3>
            </div>
            <p>
              Developed and deployed responsive web interfaces using HTML, CSS,
              JavaScript, and React.js. Improved responsiveness and user
              engagement by 40% through optimized UI components and layouts.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>B.Tech (AI & ML)</h4>
                <h5>Guru Gobind Singh Indraprastha University, Delhi</h5>
              </div>
              <h3>Sep 2023 – Aug 2027</h3>
            </div>
            <p>
              Pursuing a Bachelor of Technology in Artificial Intelligence &
              Machine Learning with a CGPA of 8.1/10.0.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
