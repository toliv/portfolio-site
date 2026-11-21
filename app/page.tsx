import { BlogPosts } from "app/components/posts";
import { ProjectPosts } from "./components/projects";

export default function Page() {
  return (
    <div className="home-page">
      <header className="home-intro">
        <h1>I’m Tony. This is my site.</h1>
        <p>Things I’m interested in and may write about:</p>
        <ul>
          <li>Building scalable, performant AI agents from scratch</li>
          <li>Lessons from founding a company during the AI hockey stick (2023–present)</li>
          <li>Serving large ML models at scale</li>
          <li>Perspectives on engineering “culture”</li>
          <li>Homelab stuff and OSS</li>
        </ul>
        <p>
          I’m currently co-founder and CTO at <a href="https://trycasa.com">Casa</a>,
          where we’re focused on making homeownership more affordable.
        </p>
      </header>
      <section className="home-section" aria-labelledby="writing-heading">
        <h2 id="writing-heading">Writing</h2>
        <BlogPosts />
      </section>
      <section className="home-section" aria-labelledby="projects-heading">
        <h2 id="projects-heading">Selected projects</h2>
        <ProjectPosts />
      </section>
    </div>
  );
}
