import { getBlogPosts } from "app/blog/utils";
import { getProjectsPosts } from "app/projects/utils";

export const baseUrl = "https://oliverio.dev";

export default async function sitemap() {
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  let projects = getProjectsPosts().map((post) => ({
    url: `${baseUrl}/projects/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  let routes = ["", "/projects", "/blog", "/books", "/contact", "/privacy/github-actions-log-copy"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...projects, ...blogs];
}
