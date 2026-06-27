export type GithubPullRequest = {
  title: string;
  repo: string;
  state: string;
  url: string;
  updatedAt: string;
};

export type BriefingContext = {
  github: GithubPullRequest[];
};
