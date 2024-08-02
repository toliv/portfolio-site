import { BlogPosts } from "app/components/posts";
import { ProjectPosts } from "./components/projects";

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Tony Oliverio
      </h1>
      <p className="mb-4">
        {`Full stack engineer with a passion for creative engineering solutions, intuitive product experiences, and happy customers 🙂`}
      </p>
      <p className="mb-4">
        {`Welcome to my personal site where I've collected some technical writing on some of my projects and experiences.`}
      </p>
      <div className="my-8 text-2xl">{`Projects`}</div>
      <div className="my-8">
        <ProjectPosts />
      </div>
      <div className="my-8 text-2xl">{`Blogs`}</div>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  );
}
