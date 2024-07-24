import Link from "next/link";
import { getProjectsPosts } from "app/projects/utils";

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
            className="flex flex-col space-y-1 mb-4"
            href={`/projects/${post.slug}`}
          >
            <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2 items-center">
              <p className="text-neutral-900 dark:text-neutral-100 tracking-tight text-lg">
                {post.metadata.title}:
              </p>
              <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
                {post.metadata.summary}
              </p>
            </div>
          </Link>
        ))}
    </div>
  );
}
