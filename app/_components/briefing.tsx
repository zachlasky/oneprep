import { generateBriefing } from '@/app/_lib/briefing';
import { type Role } from '@/app/_lib/roles';

export async function Briefing({ person, role }: { person: string; role: Role }) {
  const briefing = await generateBriefing({ person, role });

  return <article className="mt-8 whitespace-pre-wrap text-zinc-700">{briefing}</article>;
}
