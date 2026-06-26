import Link from 'next/link';
import { Suspense } from 'react';

import { ROLES, type Role } from '@/app/_lib/roles';
import { Briefing } from '@/app/_components/briefing';

const isRole = (value: string | undefined): value is Role =>
  ROLES.some((r) => r.value === value);

export default async function PrepPage({
  searchParams
}: {
  searchParams: Promise<{ person?: string; role?: string }>;
}) {
  const { person, role } = await searchParams;

  if (!person || !isRole(role)) {
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

  return (
    <main className="flex-1 p-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">Your 1:1 briefing</h1>
        <Suspense fallback={<p className="mt-8 text-zinc-500">Preparing your briefing…</p>}>
          <Briefing person={person} role={role} />
        </Suspense>
      </div>
    </main>
  );
}
