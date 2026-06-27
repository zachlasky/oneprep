import { type GithubPullRequest } from './types';

const GITHUB_API = 'https://api.github.com';
const ISSUE_CAP = 20;

// Runs a GitHub issue/PR search and maps the results. Person-centric and
// cross-repo (a person's work spans repos). Returns [] on any failure so a
// source problem never breaks the briefing.
async function searchPullRequests(query: string): Promise<GithubPullRequest[]> {
  // Token is optional for public data — raises the rate limit when present, and
  // unlocks private repos if it has those scopes.
  const token = process.env.GITHUB_TOKEN;
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
      console.error(`GitHub search failed (${res.status}): ${await res.text()}`);
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
    console.error('GitHub search errored:', err);
    return [];
  }
}

// PRs the teammate opened.
export function fetchGithubPullRequests(githubUsername: string): Promise<GithubPullRequest[]> {
  return searchPullRequests(`author:${githubUsername} type:pr`);
}

// PRs the teammate reviewed — invisible collaboration worth surfacing in a 1:1.
export function fetchGithubReviews(githubUsername: string): Promise<GithubPullRequest[]> {
  return searchPullRequests(`reviewed-by:${githubUsername} type:pr`);
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
