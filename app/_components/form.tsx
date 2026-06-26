'use client';

import { useState } from 'react';

type Role = 'skip-level-manager' | 'manager' | 'peer' | 'direct-report';

const ROLES: { value: Role; label: string }[] = [
  { value: 'skip-level-manager', label: 'Skip-Level Manager' },
  { value: 'manager', label: 'Manager' },
  { value: 'peer', label: 'Peer' },
  { value: 'direct-report', label: 'Direct Report' }
];

const MAX_EMAIL_LENGTH = 254;

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(email);
};

const Form = () => {
  const [role, setRole] = useState<Role>('manager');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Role:', role);
    console.log('Meeting with:', email);
  };

  const isSubmitDisabled = !role || !email || !validateEmail(email);

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium text-zinc-900">I&apos;m a:</legend>

        {ROLES.map(({ value, label }) => (
          <label key={value} className="flex items-center gap-3 text-zinc-700 cursor-pointer">
            <input
              type="radio"
              name="role"
              value={value}
              checked={role === value}
              onChange={() => setRole(value)}
              className="h-4 w-4 accent-indigo-600 cursor-pointer"
            />
            {label}
          </label>
        ))}
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-900">Meeting with:</span>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Search by email"
          maxLength={MAX_EMAIL_LENGTH}
          className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition-colors cursor-pointer hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300">
        Prepare
      </button>
    </form>
  );
};

export { Form };
