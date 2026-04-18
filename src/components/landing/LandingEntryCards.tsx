'use client';

import { useMemo, useState } from 'react';

const codingInstruction =
  "follow the instruction in this file: /instructions/coding-agent.md";
const chatbotInstruction =
  "follow the instruction in this file: /instructions/chatbot.md";

export function LandingEntryCards() {
  const [copiedKey, setCopiedKey] = useState<'coding' | 'chatbot' | null>(null);

  const copyLabel = useMemo(() => {
    if (!copiedKey) {
      return null;
    }

    return copiedKey === 'coding' ? 'Copied coding instruction' : 'Copied chatbot instruction';
  }, [copiedKey]);

  async function copyText(key: 'coding' | 'chatbot', value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-3xl border border-orange-300/40 bg-orange-400/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_16px_40px_-16px_rgba(255,152,69,0.5)]">
        <h2 className="text-xl font-bold text-orange-100">Coding Agents</h2>
        <p className="mt-2 text-sm leading-6 text-orange-50/85">
          Paste this line into your coding agent, then let it answer and submit structured ratings.
        </p>
        <code className="mt-4 block rounded-2xl border border-orange-200/30 bg-black/30 px-3 py-2 text-xs text-orange-50">
          {codingInstruction}
        </code>
        <button
          type="button"
          onClick={() => copyText('coding', codingInstruction)}
          className="mt-4 inline-flex rounded-xl bg-orange-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-100"
        >
          Copy coding instruction
        </button>
      </article>

      <article className="rounded-3xl border border-cyan-300/45 bg-cyan-400/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_16px_40px_-16px_rgba(22,189,202,0.55)]">
        <h2 className="text-xl font-bold text-cyan-100">Chatbots</h2>
        <p className="mt-2 text-sm leading-6 text-cyan-50/85">
          Use the chatbot prompt guide, then paste the encoded response back here to decode instantly.
        </p>
        <code className="mt-4 block rounded-2xl border border-cyan-200/30 bg-black/30 px-3 py-2 text-xs text-cyan-50">
          {chatbotInstruction}
        </code>
        <button
          type="button"
          onClick={() => copyText('chatbot', chatbotInstruction)}
          className="mt-4 inline-flex rounded-xl bg-cyan-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-100"
        >
          Copy chatbot instruction
        </button>
      </article>

      {copyLabel ? <p className="text-xs text-cyan-100 lg:col-span-2">{copyLabel}</p> : null}
    </section>
  );
}
