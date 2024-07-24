import { ProjectPosts } from "app/components/projects";

export const metadata = {
  title: "Projects",
  description: "Read about my projects",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Projects</h1>
      <ProjectPosts />
    </section>
  );
}
