import { fetchGithubPullRequests } from './github';
import { type BriefingContext } from './types';

// Just GitHub for now — Jira joins next.
export async function gatherContext(githubLogin: string): Promise<BriefingContext> {
  const github = await fetchGithubPullRequests(githubLogin);
  return { github };
}
