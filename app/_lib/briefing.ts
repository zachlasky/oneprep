import Anthropic from '@anthropic-ai/sdk';

import { gatherContext } from '@/app/_lib/sources';
import { type BriefingContext } from '@/app/_lib/sources/types';
import { type Role } from './roles';

export type BriefingInput = {
  person: string;
  role: Role;
};

const MODEL = 'claude-haiku-4-5';

// Lazily constructed and memoized. `new Anthropic()` throws if ANTHROPIC_API_KEY
// is unset, so deferring it to first call keeps importing this module safe
// before a key exists (and keeps `next build` from crashing on the dynamic route).
let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

const SYSTEM_PROMPT = `You help engineers prepare for their upcoming 1:1 meetings.`;
// A ceiling, not a target — billed on tokens actually generated, so this only
// caps runaway output. Keep it above the longest briefing you want; to make
// briefings genuinely shorter/cheaper, constrain length in the prompt instead.
const MAX_TOKENS = 4096;

function buildPrompt({
  person,
  role,
  context
}: BriefingInput & { context: BriefingContext }): string {
  const github = context.github.length
    ? context.github.map((pr) => `- [${pr.state}] ${pr.repo}: ${pr.title}`).join('\n')
    : 'No recent GitHub activity found.';

  return [
    `Prepare me for a 1:1 with ${person}. I am their ${role}.`,
    '',
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
export async function generateBriefing({ person, role }: BriefingInput): Promise<string> {
  const context = await gatherContext(person);

  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    // Disabled to keep cost down — thinking tokens bill as output.
    // Re-enable (adaptive, on an Opus/Sonnet tier) if briefing quality needs deeper reasoning.
    thinking: { type: 'disabled' },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildPrompt({ person, role, context }) }]
  });

  const textBlock = message.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );

  return textBlock?.text ?? '';
}
