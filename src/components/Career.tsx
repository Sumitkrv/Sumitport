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
                <h4>Web Developer</h4>
                <h5>Cosahyog Consultant and Care · New Delhi, India</h5>
              </div>
              <h3>Oct 2024 – Dec 2024</h3>
            </div>
            <p>
              Developed responsive web interfaces using HTML5, CSS3, and
              JavaScript (ES6+), improving user engagement by 30%. Collaborated
              with cross-functional teams and implemented UI/UX improvements
              that increased conversion by 15% while ensuring cross-browser
              compatibility.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Open Source Mentor</h4>
                <h5>GirlScript Summer of Code (GSSoC) · Remote</h5>
              </div>
              <h3>May 2025 – Present</h3>
            </div>
            <p>
              Mentored 50+ participants on open-source best practices,
              contribution workflows, and collaboration standards. Reviewed
              100+ pull requests with actionable feedback and helped reduce
              first-time contributor setup time by 40% through onboarding support.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>B.Tech (AI & ML)</h4>
                <h5>Guru Gobind Singh Indraprastha University</h5>
              </div>
              <h3>Sep 2023 – Aug 2027</h3>
            </div>
            <p>
              Pursuing a Bachelor of Technology in Artificial Intelligence and
              Machine Learning with CGPA 8.48/10.0. Building a strong foundation
              in DSA, OOPs, DBMS, CN, and Operating Systems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
