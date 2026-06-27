import { fetchGithubPullRequests } from './github';
import { type BriefingContext } from './types';

// Just GitHub for now — Jira joins next.
export async function gatherContext(githubUsername: string): Promise<BriefingContext> {
  const github = await fetchGithubPullRequests(githubUsername);
  return { github };
}
