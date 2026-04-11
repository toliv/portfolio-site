import type { Metadata } from "next";
import { baseUrl } from "app/sitemap";

export const metadata: Metadata = {
  title: "GitHub Actions Log Copy Privacy Policy",
  description:
    "Privacy policy for the GitHub Actions Log Copy browser extension.",
  openGraph: {
    title: "GitHub Actions Log Copy Privacy Policy",
    description:
      "Privacy policy for the GitHub Actions Log Copy browser extension.",
    url: `${baseUrl}/privacy/github-actions-log-copy`,
    siteName: "Tony Oliverio",
    type: "article",
  },
};

export default function GitHubActionsLogCopyPrivacyPage() {
  return (
    <section>
      <h1 className="title font-semibold text-2xl tracking-tighter">
        GitHub Actions Log Copy Privacy Policy
      </h1>
      <p className="mt-2 mb-8 text-sm text-neutral-600 dark:text-neutral-400">
        Last updated: April 11, 2026
      </p>

      <article className="prose">
        <p>
          GitHub Actions Log Copy is a browser extension that adds a copy button
          to GitHub Actions job step headers.
        </p>

        <h2>What this extension accesses</h2>
        <p>
          The extension runs only on <code>https://github.com/*</code> and only
          activates on GitHub Actions job log pages that match:
        </p>
        <p>
          <code>
            https://github.com/&lt;owner&gt;/&lt;repo&gt;/actions/runs/&lt;run-id&gt;/job/&lt;job-id&gt;
          </code>
        </p>
        <p>On those pages, the extension reads the page structure needed to:</p>
        <ul>
          <li>identify GitHub Actions step headers</li>
          <li>insert a copy button into each step header</li>
          <li>read the selected step&apos;s visible log lines</li>
          <li>
            fetch the selected step&apos;s GitHub-hosted log fragment when needed
            to capture long virtualized logs
          </li>
        </ul>

        <h2>What this extension does with data</h2>
        <p>This extension:</p>
        <ul>
          <li>does not collect personal information</li>
          <li>does not send data to any third-party server</li>
          <li>does not use analytics or tracking</li>
          <li>does not store browsing history, account data, or copied logs</li>
          <li>
            only writes text to the clipboard after the user explicitly clicks
            the copy button
          </li>
        </ul>
        <p>
          When the extension fetches a step log fragment, it makes that request
          only to GitHub using the authenticated browser session that is already
          active in the user&apos;s browser.
        </p>

        <h2>Clipboard access</h2>
        <p>
          The extension uses clipboard access only to copy the selected step&apos;s
          log text after a user clicks the copy button.
        </p>

        <h2>Data retention</h2>
        <p>The extension does not retain copied logs or other user data.</p>

        <h2>Changes</h2>
        <p>
          If this privacy policy changes, the updated version will be published
          at <code>{`${baseUrl}/privacy/github-actions-log-copy`}</code>.
        </p>

        <h2>Contact</h2>
        <p>
          Project homepage: <a href={`${baseUrl}/projects/github-actions-log-copy`}>{`${baseUrl}/projects/github-actions-log-copy`}</a>
        </p>
        <p>
          Support and issues: <a href="https://github.com/toliv/gha-log-copy/issues">https://github.com/toliv/gha-log-copy/issues</a>
        </p>
      </article>
    </section>
  );
}
