import { type ReactNode } from 'react';

// CSS-only tooltip: reveals on hover and on keyboard focus of the trigger, so
// it needs no client JS and stays a server component. The trigger is a focusable
// button; `group-hover` / `group-focus-within` drive visibility.
export function InfoTooltip({ children }: { children: ReactNode }) {
  return (
    <span className="group relative ml-2 inline-flex align-middle">
      <button
        type="button"
        aria-label="How this name was resolved"
        className="flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-zinc-300 text-xs font-medium text-zinc-500">
        i
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden w-max max-w-xs rounded-md bg-zinc-900 px-3 py-2 text-left text-xs font-normal leading-relaxed text-zinc-100 shadow-lg group-hover:block group-focus-within:block">
        {children}
      </span>
    </span>
  );
}
