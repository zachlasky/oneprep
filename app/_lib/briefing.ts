import { type Role } from './roles';

export type BriefingInput = {
  person: string;
  role: Role;
};

/**
 * Generates a 1:1 briefing. Runs ONLY on the server — this is where the
 * Anthropic API key (process.env.ANTHROPIC_API_KEY) and any GitHub/Confluence/
 * Slack credentials live. Never import this from a 'use client' component.
 *
 * TODO: gather recent context (GitHub PRs/issues, Confluence pages, Slack) for
 * `person`, build a prompt tailored to `role`, then call Claude and return the
 * generated briefing. For now it returns a placeholder so the route streams
 * end-to-end.
 */
export async function generateBriefing({ person, role }: BriefingInput): Promise<string> {
  // Placeholder for the real data-gathering + Claude call.
  return `Briefing for your 1:1 with ${person} (you are their ${role}). Generation not wired up yet.`;
}
