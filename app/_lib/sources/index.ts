import { fetchGithubPullRequests, fetchGithubReviews } from './github';
import { fetchJiraIssues } from './jira';
import { type BriefingContext } from './types';

export { fetchGithubDisplayName } from './github';
export { fetchJiraDisplayName } from './jira';

// Runs both sources in PARALLEL — total latency ≈ the slowest, not the sum.
// A source with missing creds/identity contributes [] rather than failing the briefing.
export async function gatherContext(
  githubUsername: string,
  jiraEmail: string
): Promise<BriefingContext> {
  const [githubPullRequests, githubReviews, jira] = await Promise.all([
    fetchGithubPullRequests(githubUsername),
    fetchGithubReviews(githubUsername),
    jiraEmail ? fetchJiraIssues(jiraEmail) : Promise.resolve([])
  ]);
  return { githubPullRequests, githubReviews, jira };
}
