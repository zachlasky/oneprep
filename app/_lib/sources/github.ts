import { type GithubPullRequest } from './types';

const GITHUB_API = 'https://api.github.com';
const ISSUE_CAP = 20;

// Person-centric, not repo-centric: GitHub's search API returns a user's PRs
// across ALL public repos. That's both the real design (a person's work spans
// repos) and what gives realistic history when testing against an active
// public contributor instead of one sparse repo.
export async function fetchGithubPullRequests(
  githubUsername: string
): Promise<GithubPullRequest[]> {
  // Token is optional for public data — raises the rate limit when present.
  // Will give access to private repos if the token has those scopes.
  const token = process.env.GITHUB_TOKEN;
  const query = `author:${githubUsername} type:pr`;
  const url = `${GITHUB_API}/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=${ISSUE_CAP}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error(`GitHub fetch failed (${res.status}): ${await res.text()}`);
      return [];
    }

    const data = (await res.json()) as {
      items?: {
        title: string;
        html_url: string;
        state: string;
        updated_at: string;
        repository_url: string;
      }[];
    };

    return (data.items ?? []).map((item) => ({
      title: item.title,
      repo: item.repository_url.replace(`${GITHUB_API}/repos/`, ''),
      state: item.state,
      url: item.html_url,
      updatedAt: item.updated_at
    }));
  } catch (err) {
    console.error('GitHub fetch errored:', err);
    return [];
  }
}

// Resolve a username to a display name for the UI. Always returns something
// printable: the profile name, falling back to the login, then the input — so a
// failed/empty lookup degrades to showing the username rather than breaking.
export async function fetchGithubDisplayName(githubUsername: string): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  const url = `${GITHUB_API}/users/${encodeURIComponent(githubUsername)}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error(`GitHub user fetch failed (${res.status}): ${await res.text()}`);
      return githubUsername;
    }

    const data = (await res.json()) as { name?: string | null; login?: string };
    return data.name || data.login || githubUsername;
  } catch (err) {
    console.error('GitHub user fetch errored:', err);
    return githubUsername;
  }
}
