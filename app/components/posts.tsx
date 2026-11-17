import Link from "next/link";
import { getBlogPosts } from "app/blog/utils";
import { formatDate } from "app/utils/utils";

export function BlogPosts() {
  let allBlogs = getBlogPosts();

  return (
    <div className="blog-posts">
      {allBlogs
        .sort((a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime())
        .map((post) => (
          <Link key={post.slug} className="blog-post-link" href={`/blog/${post.slug}`} prefetch={false}>
            <span className="blog-post-link-title">{post.metadata.title}</span>
            <time dateTime={post.metadata.publishedAt}>{formatDate(post.metadata.publishedAt)}</time>
          </Link>
        ))}
    </div>
  );
}
