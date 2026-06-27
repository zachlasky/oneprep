// Mirrors the briefing's shape — three sections, each a label + two lines —
// so the page doesn't reflow when the real content swaps in.
export function BriefingSkeleton() {
  return (
    <div className="mt-8 flex flex-col gap-8">
      <span role="status" className="sr-only">
        Preparing your briefing…
      </span>
      {[0, 1, 2].map((section) => (
        <div key={section} aria-hidden className="flex flex-col gap-3">
          <div className="h-4 w-28 animate-pulse rounded bg-zinc-200" />
          <div className="h-3 w-full animate-pulse rounded bg-zinc-200" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-zinc-200" />
        </div>
      ))}
    </div>
  );
}
