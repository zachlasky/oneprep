import Link from 'next/link';
import { Suspense } from 'react';

import { isRole } from '@/app/_lib/roles';
import { fetchGithubDisplayName, fetchJiraDisplayName } from '@/app/_lib/sources';
import { Briefing } from '@/app/_components/briefing';
import { BriefingSkeleton } from '@/app/_components/briefing-skeleton';
import { InfoTooltip } from '@/app/_components/info-tooltip';

export default async function PrepPage({
  searchParams
}: {
  searchParams: Promise<{ role?: string; githubUsername?: string; jiraEmail?: string }>;
}) {
  const { role, githubUsername, jiraEmail } = await searchParams;

  if (!githubUsername || !isRole(role)) {
    return (
      <main className="flex-1 p-20">
        <div className="mx-auto max-w-2xl">
          <p className="text-zinc-700">Missing or invalid meeting details.</p>
          <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
            Start over
          </Link>
        </div>
      </main>
    );
  }

  const [name, jiraName] = await Promise.all([
    fetchGithubDisplayName(githubUsername),
    jiraEmail ? fetchJiraDisplayName(jiraEmail) : Promise.resolve(null)
  ]);

  // Prefer Jira's directory name (real, properly-cased) when available; fall
  // back to GitHub's, which is always present but often informal.
  const displayName = jiraName ?? name;

  return (
    <main className="flex-1 p-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">
          Your 1:1 briefing with {displayName}
          <InfoTooltip>
            <span className="flex flex-col gap-1">
              <span>
                GitHub @{githubUsername} → {name}
              </span>
              {jiraName && (
                <span>
                  Jira {jiraEmail} → {jiraName}
                </span>
              )}
            </span>
          </InfoTooltip>
        </h1>
        <Suspense fallback={<BriefingSkeleton />}>
          <Briefing githubUsername={githubUsername} role={role} jiraEmail={jiraEmail ?? ''} />
        </Suspense>
      </div>
    </main>
  );
}
