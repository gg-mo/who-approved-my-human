'use client';

import { useMemo, useState } from 'react';

import { LobsterMascot } from '@/components/landing/LobsterMascot';

type Mode = 'coding' | 'chatbot';

type DecodeState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  hints?: Array<{ token: string; message: string; suggestedFix: string }>;
  sessionId?: string;
};

const codingInstruction = 'follow the instruction in this file: /instructions/coding-agent.md';
const chatbotInstruction = 'follow the instruction in this file: /instructions/chatbot.md';

export function LandingEntryCards() {
  const [activeMode, setActiveMode] = useState<Mode>('coding');
  const [copiedKey, setCopiedKey] = useState<Mode | null>(null);
  const [encodedPayload, setEncodedPayload] = useState('');
  const [decodeState, setDecodeState] = useState<DecodeState>({ status: 'idle' });

  const copyLabel = useMemo(() => {
    if (!copiedKey) {
      return null;
    }

    return copiedKey === 'coding' ? 'Copied coding instruction' : 'Copied chatbot instruction';
  }, [copiedKey]);

  async function copyText(key: Mode, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  }

  async function decodeChatbotPayload() {
    const payload = encodedPayload.trim();

    if (!payload) {
      setDecodeState({
        status: 'error',
        message: 'Paste an encoded answer first.',
        hints: [
          {
            token: 'PAYLOAD',
            message: 'No encoded payload found.',
            suggestedFix: 'Paste a line that starts with AT1|Q01-... before decoding.',
          },
        ],
      });
      return;
    }

    try {
      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intakeMode: 'chatbot' }),
      });
      const sessionData = await sessionResponse.json();

      if (!sessionResponse.ok || !sessionData.sessionId) {
        throw new Error(sessionData.error ?? 'Failed to create chatbot session.');
      }

      const ingestResponse = await fetch(`/api/sessions/${sessionData.sessionId}/ingest-encoded`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });

      const ingestData = await ingestResponse.json();

      if (!ingestResponse.ok) {
        setDecodeState({
          status: 'error',
          sessionId: sessionData.sessionId,
          message: 'The encoded line needs a quick fix.',
          hints: (ingestData.hints ?? []).map((hint: Record<string, string>) => ({
            token: hint.token,
            message: hint.message,
            suggestedFix: hint.suggestedFix,
          })),
        });
        return;
      }

      setDecodeState({
        status: 'success',
        sessionId: sessionData.sessionId,
        message: 'Decoded successfully. You can now score and reveal results.',
      });
    } catch (error) {
      setDecodeState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to decode chatbot payload.',
      });
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article className="relative overflow-hidden rounded-3xl border border-orange-300/40 bg-orange-400/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_16px_40px_-16px_rgba(255,152,69,0.5)]">
        <LobsterMascot
          variant="card"
          className="pointer-events-none absolute -right-6 -top-8 w-28 rotate-6 opacity-35"
        />
        <h2 className="text-xl font-bold text-orange-100">Coding Agents</h2>
        <p className="mt-2 text-sm leading-6 text-orange-50/85">
          Paste this line into your coding agent, then let it answer and submit structured ratings.
        </p>
        <code className="mt-4 block rounded-2xl border border-orange-200/30 bg-black/30 px-3 py-2 text-xs text-orange-50">
          {codingInstruction}
        </code>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => copyText('coding', codingInstruction)}
            className="inline-flex rounded-xl bg-orange-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-100"
          >
            Copy coding instruction
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('coding')}
            className="inline-flex rounded-xl border border-orange-200/60 px-4 py-2 text-sm font-semibold text-orange-50 transition hover:bg-orange-100/10"
          >
            Use coding flow
          </button>
        </div>
      </article>

      <article className="relative overflow-hidden rounded-3xl border border-cyan-300/45 bg-cyan-400/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_16px_40px_-16px_rgba(22,189,202,0.55)]">
        <LobsterMascot
          variant="card"
          className="pointer-events-none absolute -right-6 -top-8 w-28 -rotate-6 opacity-35"
        />
        <h2 className="text-xl font-bold text-cyan-100">Chatbots</h2>
        <p className="mt-2 text-sm leading-6 text-cyan-50/85">
          Use the chatbot prompt guide, then paste the encoded response back here to decode instantly.
        </p>
        <code className="mt-4 block rounded-2xl border border-cyan-200/30 bg-black/30 px-3 py-2 text-xs text-cyan-50">
          {chatbotInstruction}
        </code>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => copyText('chatbot', chatbotInstruction)}
            className="inline-flex rounded-xl bg-cyan-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-100"
          >
            Copy chatbot instruction
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('chatbot')}
            className="inline-flex rounded-xl border border-cyan-200/60 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-100/10"
          >
            Use chatbot flow
          </button>
        </div>
      </article>

      {activeMode === 'chatbot' ? (
        <section className="rounded-3xl border border-cyan-200/30 bg-cyan-200/10 p-5 lg:col-span-2">
          <label htmlFor="chatbotEncodedPayload" className="text-sm font-semibold text-cyan-100">
            Paste chatbot encoded answer
          </label>
          <textarea
            id="chatbotEncodedPayload"
            value={encodedPayload}
            onChange={(event) => setEncodedPayload(event.target.value)}
            placeholder="AT1|Q01-5AQ02-4AQ03-3..."
            className="mt-2 h-28 w-full rounded-2xl border border-cyan-100/25 bg-slate-950/70 px-3 py-2 text-sm text-cyan-50 outline-none ring-cyan-300/50 focus:ring"
          />
          <button
            type="button"
            onClick={decodeChatbotPayload}
            className="mt-3 inline-flex rounded-xl bg-cyan-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-100"
          >
            Decode encoded answer
          </button>

          {decodeState.message ? (
            <p
              className={`mt-3 text-sm ${
                decodeState.status === 'success' ? 'text-emerald-200' : 'text-rose-200'
              }`}
            >
              {decodeState.message}
            </p>
          ) : null}

          {decodeState.hints && decodeState.hints.length > 0 ? (
            <ul className="mt-3 space-y-2 text-xs text-cyan-50/90">
              {decodeState.hints.map((hint, index) => (
                <li key={`${hint.token}-${index}`} className="rounded-xl border border-cyan-100/20 bg-black/20 p-2">
                  <p className="font-semibold">{hint.token}</p>
                  <p>{hint.message}</p>
                  <p className="text-cyan-200/90">Fix: {hint.suggestedFix}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {copyLabel ? <p className="text-xs text-cyan-100 lg:col-span-2">{copyLabel}</p> : null}
    </section>
  );
}
