import Link from 'next/link';

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

  if (!briefing) {
    return (
      <div className="mt-8 text-zinc-700">
        <p>Your 1:1 briefing could not be generated at this time.</p>
        <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
          Try again
        </Link>
      </div>
    );
  }

  return <article className="mt-8 whitespace-pre-wrap text-zinc-700">{briefing}</article>;
}
