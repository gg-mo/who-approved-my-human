import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What Agent Tea collects, why, where it lives, and how to ask for it to be deleted.',
};

const UPDATED = 'April 2026';

export default function PrivacyPage() {
  return (
    <>
      <p className="tea-eyebrow text-cyan-200/85">Privacy notice</p>
      <h1 className="tea-display mt-3 text-[2.25rem] leading-[1.1] text-white sm:text-[2.75rem]">
        The short, plain-English version.
      </h1>
      <p className="mt-3 text-xs uppercase tracking-widest text-slate-400">
        Last updated {UPDATED}
      </p>

      <div className="mt-10 space-y-8 text-[1rem] leading-[1.75] text-slate-200/90">
        <section>
          <h2 className="text-lg font-semibold text-white">What Agent Tea is</h2>
          <p className="mt-2">
            Agent Tea is a for-fun personality snapshot. You (or your chatbot)
            answer 32 Likert questions, and we build a four-letter &ldquo;type&rdquo;
            based on the responses. That&rsquo;s it. We are not a psychological
            assessment, and nothing here is medical, diagnostic, or HR-grade.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">What we collect</h2>
          <ul className="mt-2 space-y-2 list-disc pl-5">
            <li>
              <strong>Your answers.</strong> The 1–5 values for each question,
              tied to a random session ID we generate for you.
            </li>
            <li>
              <strong>A referral code,</strong> if you arrived via a share link.
              Stored in your browser&rsquo;s <code>localStorage</code> so we can
              credit the person who sent you.
            </li>
            <li>
              <strong>Basic usage events</strong> (page views, button clicks,
              copy-quote, share-card opens) — no keystrokes, no mouse tracking.
            </li>
            <li>
              <strong>Privacy-friendly analytics</strong> via Vercel Analytics
              (aggregate visit counts, country, device class). No cookies set
              for advertising.
            </li>
            <li>
              <strong>If you sign in,</strong> an email address via Supabase Auth
              so you can reopen past reveals.
            </li>
          </ul>
          <p className="mt-3">
            We do <em>not</em> collect the free-text you paste during a session
            (the encoded payload is parsed for numeric answers only and then the
            raw string is dropped).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Where it lives</h2>
          <p className="mt-2">
            Sessions and answers are stored in Supabase (Postgres, hosted in the
            EU/US depending on project region). The site is served via Vercel.
            Both are standard managed infrastructure providers acting as
            processors on our behalf.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">How long we keep it</h2>
          <p className="mt-2">
            While Agent Tea is live, we generally keep session data so your
            result link keeps working. If you want a specific session or your
            whole account removed, email us and we&rsquo;ll take care of it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Your choices</h2>
          <p className="mt-2">
            You can clear your referral by clearing site storage. You can ask us
            to delete a specific session (send us the session ID) or your
            account. If you&rsquo;re in the EU/UK, you also have the usual GDPR
            rights: access, correction, deletion, objection.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <p className="mt-2">
            Email{' '}
            <a
              href="mailto:happyhhour123@gmail.com"
              className="text-cyan-200 underline-offset-4 hover:underline"
            >
              happyhhour123@gmail.com
            </a>{' '}
            for anything privacy-related. We read everything, even the grumpy
            ones.
          </p>
        </section>
      </div>
    </>
  );
}
