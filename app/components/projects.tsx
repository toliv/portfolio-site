import Link from "next/link";
import { getProjectsPosts } from "app/projects/utils";

export function ProjectPosts() {
  let projects = getProjectsPosts();

  return (
    <div className="project-posts">
      {projects
        .sort((a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime())
        .map((post) => (
          <Link
            key={post.slug}
            className="project-post-link"
            href={`/projects/${post.slug}`}
            prefetch={false}
          >
            <span className="project-post-link-title">{post.metadata.title}</span>
            <span className="project-post-link-summary">{post.metadata.summary}</span>
          </Link>
        ))}
    </div>
  );
}
