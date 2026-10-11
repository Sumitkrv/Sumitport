import { PropsWithChildren } from "react";
import "./styles/Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              SUMIT
              <br />
              <span>THAKUR</span>
            </h1>
          </div>
          <div className="landing-info">
            <h3>A Software</h3>
            <h2 className="landing-info-h2 landing-role-slot">
              <div className="landing-role-title">Developer</div>
              <div className="landing-role-title">Full-Stack Developer</div>
              <div className="landing-role-title">AI &amp; Automation Enthusiast</div>
            </h2>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
