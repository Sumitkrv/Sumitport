import "./styles/Achievements.css";

const achievements = [
  {
    title: "President, Geek Room",
    detail: "Organized 3+ national hackathons with 1,000+ participants.",
  },
  {
    title: "1st Place — HackWithDelhi 2024",
    detail: "Built an AI-based mental health solution.",
  },
  {
    title: "Top 5 — Microsoft Code Seva Hackathon 2024",
    detail: "Recognized among the leading teams in the competition.",
  },
  {
    title: "Semifinalist — Code Cubicle 2.0",
    detail: "Top 100 among 2,000+ teams.",
  },
];

const Achievements = () => (
  <section className="achievements-section section-container" id="achievements">
    <h2>
      Achievements <span>&</span>
      <br /> leadership
    </h2>
    <div className="achievements-grid">
      {achievements.map((achievement) => (
        <article className="achievement-card" key={achievement.title}>
          <h3>{achievement.title}</h3>
          <p>{achievement.detail}</p>
        </article>
      ))}
    </div>
  </section>
);

export default Achievements;
