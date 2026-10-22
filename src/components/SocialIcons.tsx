import {
  FaGithub,
  FaLinkedinIn,
} from "react-icons/fa6";
import "./styles/SocialIcons.css";
import { TbNotes } from "react-icons/tb";
import HoverLinks from "./HoverLinks";

const SocialIcons = () => {

  return (
    <div className="icons-section icons-section-hero">
      <div className="social-icons" data-cursor="icons" id="social">
        <span>
          <a href="https://github.com/Sumitkrv" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" title="GitHub">
            <FaGithub />
          </a>
        </span>
        <span>
          <a href="https://www.linkedin.com/in/sumit-thakur-80ba72278" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" title="LinkedIn">
            <FaLinkedinIn />
          </a>
        </span>
      </div>
      <a
        className="resume-button"
        href="https://www.linkedin.com/in/sumit-thakur-80ba72278"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Sumit Thakur LinkedIn profile"
      >
        <HoverLinks text="PROFILE" />
        <span>
          <TbNotes />
        </span>
      </a>
    </div>
  );
};

export default SocialIcons;
