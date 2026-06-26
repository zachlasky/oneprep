import { Form } from '@/app/_components/form';

export default function Home() {
  return (
    <main className="flex-1 p-20">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Prepare for your next 1:1</h1>

        <Form />
      </div>
    </main>
  );
}
