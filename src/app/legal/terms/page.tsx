import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms',
  description:
    'The rules of the road for using Agent Tea — lightweight, plain English.',
};

const UPDATED = 'April 2026';

export default function TermsPage() {
  return (
    <>
      <p className="tea-eyebrow text-orange-200/85">Terms of use</p>
      <h1 className="tea-display mt-3 text-[2.25rem] leading-[1.1] text-white sm:text-[2.75rem]">
        Rules of the road.
      </h1>
      <p className="mt-3 text-xs uppercase tracking-widest text-slate-400">
        Last updated {UPDATED}
      </p>

      <div className="mt-10 space-y-8 text-[1rem] leading-[1.75] text-slate-200/90">
        <section>
          <h2 className="text-lg font-semibold text-white">What this is</h2>
          <p className="mt-2">
            Agent Tea is a piece of internet entertainment. You tell us (or let
            your chatbot tell us) how you collaborate with AI, and we return a
            playful four-letter type. Treat the result as a conversation
            starter, not a verdict on your personality, employability, or soul.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">What you agree to</h2>
          <ul className="mt-2 space-y-2 list-disc pl-5">
            <li>
              Use the site for its obvious purpose. Don&rsquo;t try to break,
              scrape, or flood it.
            </li>
            <li>
              Don&rsquo;t submit content that impersonates someone else, is
              abusive toward a real person, or breaks any law where you live.
            </li>
            <li>
              You&rsquo;re at least 13 years old (or the local minimum age for
              online services, whichever is higher).
            </li>
            <li>
              Share links are public by design — anyone with the link can view
              the reveal. Don&rsquo;t paste information you don&rsquo;t want
              attached to a link.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Not advice</h2>
          <p className="mt-2">
            Nothing Agent Tea generates is mental-health, medical, legal,
            financial, or employment advice. We are explicitly not a hiring or
            evaluation tool and should not be used to make decisions about
            other people.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">No guarantees</h2>
          <p className="mt-2">
            The site is provided &ldquo;as is.&rdquo; We try to keep it up and
            accurate, but we don&rsquo;t promise it will be bug-free,
            uninterrupted, or perfectly correct. To the extent the law allows,
            we&rsquo;re not liable for indirect, incidental, or consequential
            damages from using it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Changes</h2>
          <p className="mt-2">
            We may update these terms as the product evolves. The &ldquo;last
            updated&rdquo; date at the top reflects the current version.
            Continued use after changes means you accept the new version.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <p className="mt-2">
            Questions or complaints:{' '}
            <a
              href="mailto:happyhhour123@gmail.com"
              className="text-cyan-200 underline-offset-4 hover:underline"
            >
              happyhhour123@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </>
  );
}
