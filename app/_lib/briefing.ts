import { unstable_cache } from 'next/cache';

import Anthropic from '@anthropic-ai/sdk';

import { gatherContext } from '@/app/_lib/sources';
import { type BriefingContext } from '@/app/_lib/sources/types';
import { type Role } from './roles';

export type BriefingInput = {
  github: string;
  role: Role;
};

// A ceiling, not a target — billed on tokens actually generated, so this only
// caps runaway output. Keep it above the longest briefing you want; to make
// briefings genuinely shorter/cheaper, constrain length in the prompt instead.
const MAX_TOKENS = 4096;
const MODEL = 'claude-haiku-4-5';
const REVALIDATE_INTERVAL = 60 * 60 * 24; // 1 day
const BRIEFING_UNAVAILABLE =
  'Your 1:1 briefing could not be generated at this time. Please try again later.';
const SYSTEM_PROMPT = `
  You help an engineer prepare for a 1:1 with a teammate, using the recent work activity provided in the user's message.
  Output plain text only — no Markdown. Do not use #, *, **, or backticks.
  Write exactly three sections, in this order. Put each section's label on its own line, then exactly two points, each on its own line beginning with a bullet "• ", with a blank line between sections:

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

function buildPrompt({ role, context }: BriefingInput & { context: BriefingContext }): string {
  const today = new Date().toISOString().slice(0, 10);

  const github = context.github.length
    ? context.github
        .map(
          (pr) => `- [${pr.state}] ${pr.repo}: ${pr.title} (updated ${pr.updatedAt.slice(0, 10)})`
        )
        .join('\n')
    : 'No recent GitHub activity found.';

  return [
    `Today is ${today}.`,
    `Prepare me for a 1:1. I am their ${role}.`,
    `Their recent GitHub pull requests:\n${github}`
  ].join('\n');
}

/**
 * Generates a 1:1 briefing. Runs ONLY on the server — this is where the
 * Anthropic API key lives. Never import this from a 'use client' component.
 *
 * Phase 2+ will gather GitHub/Jira context for `person` and weave
 * it into buildPrompt before this call.
 */
// Cached per-params for a day. THROWS on any failure (no activity, API error)
// so unstable_cache never caches a failure — only successful briefings are
// stored, and a failed attempt re-runs on the next request.
const cachedBriefing = unstable_cache(
  async ({ github, role }: BriefingInput): Promise<string> => {
    const context = await gatherContext(github);
    if (!context.github.length) throw new Error('No GitHub activity to brief on.');

    const message = await getClient().messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Disabled to keep cost down — thinking tokens bill as output.
      // Re-enable (adaptive, on an Opus/Sonnet tier) if briefing quality needs deeper reasoning.
      thinking: { type: 'disabled' },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildPrompt({ github, role, context }) }]
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

export async function generateBriefing(input: BriefingInput): Promise<string> {
  try {
    return await cachedBriefing(input);
  } catch (err) {
    console.error('Briefing generation failed:', err);
    return BRIEFING_UNAVAILABLE;
  }
}
