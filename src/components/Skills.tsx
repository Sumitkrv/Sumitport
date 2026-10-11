import "./styles/Skills.css";

const skillGroups = [
  ["Programming Languages", "C++", "Python", "Java", "JavaScript (ES6+)", "SQL"],
  [
    "Core Computer Science",
    "Data Structures and Algorithms",
    "Object-Oriented Programming",
    "DBMS",
    "Operating Systems",
    "Computer Networks",
  ],
  [
    "Frontend Development",
    "React.js",
    "Vite",
    "Tailwind CSS",
    "React Router",
    "Zustand",
    "Axios",
    "HTML5",
    "CSS3",
  ],
  [
    "Backend Development",
    "Node.js",
    "Flask",
    "FastAPI",
    "REST APIs",
    "JWT Authentication",
    "Gunicorn",
    "Uvicorn",
  ],
  ["Databases", "MongoDB", "PostgreSQL", "Redis"],
  [
    "Testing and Quality Assurance",
    "Pytest",
    "Vitest",
    "Playwright",
    "Unit Testing",
    "Functional Testing",
    "Test Automation",
  ],
  ["DevOps and Tools", "Vercel", "Cloudinary", "Sentry", "Git", "GitHub"],
  ["App Development", "React Native", "Expo", "React Navigation"],
];

const Skills = () => (
  <section className="skills-section section-container" id="skills">
    <h2>
      Technical <span>Skills</span>
    </h2>
    <div className="skills-grid">
      {skillGroups.map(([category, ...skills]) => (
        <article className="skill-group" key={category}>
          <h3>{category}</h3>
          <div className="skill-tags">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default Skills;
