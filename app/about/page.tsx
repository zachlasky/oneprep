export default function AboutPage() {
  return (
    <main className="flex-1 p-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">About OnePrep</h1>
        <div className="mt-4 flex flex-col gap-4 text-zinc-700">
          <p>
            Most 1:1 meetings start cold. You sit down with a teammate and spend the first ten
            minutes trying to remember what they have been working on, what shipped, and what got
            stuck. OnePrep removes that scramble. It gathers a teammate&apos;s recent work and turns
            it into a focused briefing you can read in a minute before the meeting starts.
          </p>
          <p>
            It works by pulling signal from the tools where work actually happens. From GitHub it
            reads the pull requests they have opened and the pull requests they have reviewed for
            others, so you can see both what they are shipping and the collaboration that often goes
            unnoticed. From Jira it reads the issues assigned to them in the current sprint, so you
            can see what is in flight and what might be blocked. Jira is optional, so a briefing still
            works with GitHub on its own.
          </p>
          <p>
            The briefing itself is short and structured. It reads the gathered activity and writes a
            small set of strengths worth recognizing, concerns worth watching, and questions worth
            asking. Every point is grounded in real activity rather than generic advice, and the
            framing adapts to your relationship with the teammate, whether you are their manager, a
            peer, a direct report, or a skip level.
          </p>
          <p>
            The goal is simple. Walk into every 1:1 already knowing the shape of the conversation, so
            the time you spend together goes to the things that matter.
          </p>
        </div>
      </div>
    </main>
  );
}
