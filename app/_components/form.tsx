'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ROLES, type Role } from '@/app/_lib/roles';

type Step = 1 | 2 | 3;

// GitHub usernames are 1–39 chars. Min is enforced by the non-empty `canProceed`
// gate; this caps the max at the keyboard.
const GITHUB_MAX_LENGTH = 39;

const inputClass =
  'rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
const nextClass =
  'rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition-colors cursor-pointer hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300';
const backClass =
  'rounded-md border border-zinc-300 px-4 py-2 font-medium text-zinc-700 transition-colors cursor-pointer hover:bg-zinc-50';

const Form = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [github, setGithub] = useState('');
  const [confluence, setConfluence] = useState('');

  const selectRole = (value: Role) => {
    setRole(value);
    setStep(2);
  };

  const canProceed = step === 2 ? github.trim() !== '' : confluence.trim() !== '';

  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  const goNext = () => {
    if (!canProceed) return;
    if (step === 2) setStep(3);
    else if (role) {
      const params = new URLSearchParams({
        role,
        github: github.trim(),
        confluence: confluence.trim()
      });
      router.push(`/prep?${params.toString()}`);
    }
  };

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    goNext();
  };

  if (step === 1) {
    return (
      <fieldset className="mt-8 flex flex-col gap-4">
        <legend className="mb-1 text-sm font-medium text-zinc-900">I&apos;m a:</legend>
        <div className="flex flex-wrap gap-3">
          {ROLES.map(({ value, label }) => {
            const selected = role === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => selectRole(value)}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-zinc-300 text-zinc-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700'
                }`}>
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-8">
      {step === 2 && (
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-900">
            My teammate&apos;s GitHub username is
          </span>
          <input
            type="text"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="octocat"
            maxLength={GITHUB_MAX_LENGTH}
            className={inputClass}
          />
        </label>
      )}

      {step === 3 && (
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-900">
            My teammate&apos;s Confluence Id is
          </span>
          <input
            type="text"
            value={confluence}
            onChange={(e) => setConfluence(e.target.value)}
            placeholder="557058:..."
            className={inputClass}
          />
        </label>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={goBack} className={`flex-1 ${backClass}`}>
          Back
        </button>
        <button type="submit" disabled={!canProceed} className={`flex-1 ${nextClass}`}>
          {step === 3 ? 'Prepare' : 'Next'}
        </button>
      </div>
    </form>
  );
};

export { Form };
