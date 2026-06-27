import { type JiraIssue } from './types';

// Atlassian accountId charset — used as a defense-in-depth check before the id
// (returned by user search) is interpolated into JQL.
const ACCOUNT_ID = /^[a-zA-Z0-9:_-]{1,128}$/;
const MAX_USER_RESULTS = 10;
const MAX_ISSUE_RESULTS = 20;

type JiraConfig = { site: string; auth: string };

// Tolerate JIRA_SITE with or without a protocol / trailing slash — jiraGet
// prepends "https://", so a prefix here would double it → ENOTFOUND 'https'.
export function normalizeSite(raw: string | undefined): string | undefined {
  return raw?.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

function jiraConfig(): JiraConfig | null {
  const site = normalizeSite(process.env.JIRA_SITE);
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  if (!site || !email || !token) return null;
  return { site, auth: Buffer.from(`${email}:${token}`).toString('base64') };
}

function jiraGet(config: JiraConfig, path: string): Promise<Response> {
  return fetch(`https://${config.site}${path}`, {
    headers: { Authorization: `Basic ${config.auth}`, Accept: 'application/json' },
    cache: 'no-store'
  });
}

type JiraUser = { accountId: string; displayName: string };

// Resolve a user-typed email into the teammate's Atlassian account.
// We match on emailAddress EXACTLY (case-insensitive), so a typed value can only
// resolve to the person who owns that email. The query goes into a URL param
// (encoded) — never into JQL — so it can't inject.
async function resolveJiraUser(config: JiraConfig, email: string): Promise<JiraUser | null> {
  const target = email.trim().toLowerCase();
  try {
    const res = await jiraGet(
      config,
      `/rest/api/3/user/search?query=${encodeURIComponent(target)}&maxResults=${MAX_USER_RESULTS}`
    );
    if (!res.ok) {
      console.error(`Jira user search failed (${res.status}): ${await res.text()}`);
      return null;
    }
    const users = (await res.json()) as {
      accountId?: string;
      displayName?: string;
      emailAddress?: string;
    }[];
    const match = users.find((u) => u.emailAddress?.toLowerCase() === target);
    if (!match?.accountId) return null;
    return { accountId: match.accountId, displayName: match.displayName ?? email };
  } catch (err) {
    console.error('Jira user search errored:', err);
    return null;
  }
}

// Open-sprint issues for a teammate, looked up by email.
// `assignee` matches by Atlassian accountId (not name/email — GDPR), so we
// resolve the typed email to an accountId first.
// Requires a Jira Software (Scrum) board with an active sprint — on a Kanban
// board `openSprints()` errors, so drop that clause and use just
// `assignee = "<id>" ORDER BY updated DESC`.
export async function fetchJiraIssues(email: string): Promise<JiraIssue[]> {
  const config = jiraConfig();
  if (!config) return [];

  const user = await resolveJiraUser(config, email);
  if (!user || !ACCOUNT_ID.test(user.accountId)) return [];

  const jql = `assignee = "${user.accountId}" AND sprint in openSprints() ORDER BY updated DESC`;

  try {
    const res = await jiraGet(
      config,
      `/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&fields=summary,status&maxResults=${MAX_ISSUE_RESULTS}`
    );
    if (!res.ok) {
      console.error(`Jira fetch failed (${res.status}): ${await res.text()}`);
      return [];
    }

    const data = (await res.json()) as {
      issues?: { key: string; fields: { summary: string; status: { name: string } } }[];
    };

    return (data.issues ?? []).map((issue) => ({
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status.name,
      url: `https://${config.site}/browse/${issue.key}`
    }));
  } catch (err) {
    console.error('Jira fetch errored:', err);
    return [];
  }
}

// Resolve an email to the teammate's Jira display name for the UI. Returns null
// when Jira isn't configured or the email matches no user.
export async function fetchJiraDisplayName(email: string): Promise<string | null> {
  const config = jiraConfig();
  if (!config) return null;
  const user = await resolveJiraUser(config, email);
  return user?.displayName ?? null;
}
