import { unstable_cache } from 'next/cache';

import Anthropic from '@anthropic-ai/sdk';

import { gatherContext } from '@/app/_lib/sources';
import { type BriefingContext } from '@/app/_lib/sources/types';
import { type Role } from './roles';

export type BriefingInput = {
  githubUsername: string;
  role: Role;
  jiraEmail: string;
};

// A ceiling, not a target — billed on tokens actually generated, so this only
// caps runaway output. Keep it above the longest briefing you want; to make
// briefings genuinely shorter/cheaper, constrain length in the prompt instead.
const MAX_TOKENS = 4096;
const MODEL = 'claude-haiku-4-5';
const REVALIDATE_INTERVAL = 60 * 60 * 24; // 1 day
const SYSTEM_PROMPT = `
  You help an engineer prepare for a 1:1 with a teammate, using the recent work activity provided in the user's message.
  Output plain text only — no Markdown. Do not use #, *, **, or backticks.
  Write exactly three sections, in this order. Put each section's label on its own line, then exactly three points, each on its own line beginning with a bullet "• ", with a blank line between sections:

  Strengths — things going well that are worth recognizing.
  Concerns — risks, blockers, or things to keep an eye on.
  Questions — open questions to ask in the meeting.

  Ground every point in the provided activity rather than generic advice.
  Keep each point to one or two sentences, and frame everything from the user's role relative to the teammate.
`;

// Lazily constructed and memoized. `new Anthropic()` throws if ANTHROPIC_API_KEY
// is unset, so deferring it to first call keeps importing this module safe
// before a key exists (and keeps `next build` from crashing on the dynamic route).
let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

function buildPrompt({ role, context }: { role: Role; context: BriefingContext }): string {
  const today = new Date().toISOString().slice(0, 10);

  const formatPrs = (prs: BriefingContext['githubPullRequests']) =>
    prs
      .map((pr) => `- [${pr.state}] ${pr.repo}: ${pr.title} (updated ${pr.updatedAt.slice(0, 10)})`)
      .join('\n');

  const sections = [`Today is ${today}.`, `Prepare me for a 1:1. I am their ${role}.`];

  // Each section is included only when it has content, so the model never sees a
  // dangling header it might comment on or fabricate around.
  if (context.githubPullRequests.length) {
    sections.push(`Pull requests they opened:\n${formatPrs(context.githubPullRequests)}`);
  }
  if (context.githubReviews.length) {
    sections.push(`Pull requests they reviewed:\n${formatPrs(context.githubReviews)}`);
  }
  if (context.jira.length) {
    const jira = context.jira
      .map((issue) => `- [${issue.status}] ${issue.key}: ${issue.summary}`)
      .join('\n');
    sections.push(`Their current Jira sprint issues:\n${jira}`);
  }

  return sections.join('\n');
}

/**
 * Generates a 1:1 briefing. Runs ONLY on the server — this is where the
 * Anthropic API key lives. Never import this from a 'use client' component.
 */
// Cached per-params for a day. THROWS on any failure (no activity, API error)
// so unstable_cache never caches a failure — only successful briefings are
// stored, and a failed attempt re-runs on the next request.
const cachedBriefing = unstable_cache(
  async ({ githubUsername, role, jiraEmail }: BriefingInput): Promise<string> => {
    const context = await gatherContext(githubUsername, jiraEmail);
    // GitHub is the required source (opened PRs or reviews given); Jira is
    // optional, additive context whose absence or failure never fails the
    // briefing — fetchJiraIssues returns [] rather than throwing.
    if (!context.githubPullRequests.length && !context.githubReviews.length) {
      throw new Error('No GitHub activity to brief on.');
    }

    const message = await getClient().messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Disabled to keep cost down — thinking tokens bill as output.
      // Re-enable (adaptive, on an Opus/Sonnet tier) if briefing quality needs deeper reasoning.
      thinking: { type: 'disabled' },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildPrompt({ role, context }) }]
    });

    const text = message.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    )?.text;
    if (!text) throw new Error('Empty briefing from model.');

    return text;
  },
  ['briefing'],
  { revalidate: REVALIDATE_INTERVAL }
);

// Returns null on failure (no activity, API error). Callers render the
// user-facing fallback; failures are never cached (cachedBriefing throws).
export async function generateBriefing(input: BriefingInput): Promise<string | null> {
  try {
    return await cachedBriefing(input);
  } catch (err) {
    console.error('Briefing generation failed:', err);
    return null;
  }
}
