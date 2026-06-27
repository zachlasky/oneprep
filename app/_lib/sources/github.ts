import { type GithubPullRequest } from './types';

const GITHUB_API = 'https://api.github.com';
const ISSUE_CAP = 20;

// Person-centric, not repo-centric: GitHub's search API returns a user's PRs
// across ALL public repos. That's both the real design (a person's work spans
// repos) and what gives realistic history when testing against an active
// public contributor instead of one sparse repo.
export async function fetchGithubPullRequests(username: string): Promise<GithubPullRequest[]> {
  // Token is optional for public data — raises the rate limit when present.
  // Will give access to private repos if the token has those scopes.
  const token = process.env.GITHUB_TOKEN;
  const query = `author:${username} type:pr`;
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
