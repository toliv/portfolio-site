import Link from "next/link";
import { getProjectsPosts } from "app/projects/utils";
import { InteractiveTitle } from "./interactive-title";

export function ProjectPosts() {
  let allBlogs = getProjectsPosts();

  return (
    <div>
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1;
          }
          return 1;
        })
        .map((post) => (
          <Link
            key={post.slug}
            className="group mb-4 flex flex-col space-y-1 focus-visible:outline-none"
            href={`/projects/${post.slug}`}
          >
            <div className="w-full flex flex-col items-start space-x-0 md:flex-row md:space-x-2">
              <p className="text-lg text-neutral-900 dark:text-neutral-100 tracking-tight">
                {post.metadata.title}:
              </p>
              <InteractiveTitle
                className="min-w-0 text-neutral-900 dark:text-neutral-100 tracking-tight"
                title={post.metadata.summary}
              />
            </div>
          </Link>
        ))}
    </div>
  );
}
