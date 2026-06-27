export type GithubPullRequest = {
  title: string;
  repo: string;
  state: string;
  url: string;
  updatedAt: string;
};

export type JiraIssue = {
  key: string;
  summary: string;
  status: string;
  url: string;
};

export type BriefingContext = {
  github: GithubPullRequest[];
  jira: JiraIssue[];
};
