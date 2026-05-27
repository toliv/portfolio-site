import Link from "next/link";
import { getBlogPosts } from "app/blog/utils";
import { formatDate } from "app/utils/utils";
import { InteractiveTitle } from "./interactive-title";

export function BlogPosts() {
  let allBlogs = getBlogPosts();

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
            href={`/blog/${post.slug}`}
            prefetch={false}
          >
            <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-8">
              <p className="text-neutral-600 dark:text-neutral-400 w-[100px] tabular-nums">
                {formatDate(post.metadata.publishedAt, false)}
              </p>
              <InteractiveTitle
                className="min-w-0 text-neutral-900 dark:text-neutral-100 tracking-tight"
                title={post.metadata.title}
              />
            </div>
          </Link>
        ))}
    </div>
  );
}
