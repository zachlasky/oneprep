import { generateBriefing } from '@/app/_lib/briefing';
import { type Role } from '@/app/_lib/roles';

export async function Briefing({
  githubUsername,
  role,
  jiraEmail
}: {
  githubUsername: string;
  role: Role;
  jiraEmail: string;
}) {
  const briefing = await generateBriefing({ githubUsername, role, jiraEmail });

  return <article className="mt-8 whitespace-pre-wrap text-zinc-700">{briefing}</article>;
}
