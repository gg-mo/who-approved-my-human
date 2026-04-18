'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [cardsReady, setCardsReady] = useState(false);
  const [showChatbotBot, setShowChatbotBot] = useState(false);
  const [copiedKey, setCopiedKey] = useState<Mode | null>(null);
  const [encodedPayload, setEncodedPayload] = useState('');
  const [decodeState, setDecodeState] = useState<DecodeState>({ status: 'idle' });
  const chatbotBotRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCardsReady(true);
    }, 60);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showChatbotBot) {
      return;
    }

    const timer = window.setTimeout(() => {
      chatbotBotRef.current?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'center',
      });
    }, 140);

    return () => window.clearTimeout(timer);
  }, [showChatbotBot]);

  const copyLabel = useMemo(() => {
    if (!copiedKey) {
      return null;
    }

    return copiedKey === 'coding' ? 'Copied coding instruction' : 'Copied chatbot instruction';
  }, [copiedKey]);

  async function copyText(key: Mode, value: string) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    }

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
      const referralCode = localStorage.getItem('agentTeaReferral') ?? undefined;
      const referralUuid = referralCode && /^[0-9a-f-]{36}$/i.test(referralCode) ? referralCode : undefined;

      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intakeMode: 'chatbot',
          referralCode,
          referrerSessionId: referralUuid,
        }),
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
        void fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName: 'answers_ingest_failed',
            sessionId: sessionData.sessionId,
            eventPayload: {
              source: 'chatbot',
              hintCount: Array.isArray(ingestData.hints) ? ingestData.hints.length : 0,
            },
          }),
        }).catch(() => undefined);

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
        message: 'Decoded successfully. Scoring your result...',
      });

      await fetch(`/api/sessions/${sessionData.sessionId}/score`, {
        method: 'POST',
      });
      void fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'chatbot_flow_completed',
          sessionId: sessionData.sessionId,
        }),
      }).catch(() => undefined);

      window.location.assign(`/results/${sessionData.sessionId}`);
    } catch (error) {
      setDecodeState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to decode chatbot payload.',
      });
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article
        onClick={() => {
          setSelectedMode('coding');
          setShowChatbotBot(false);
        }}
        className={`relative overflow-hidden rounded-3xl border border-orange-300/40 bg-orange-400/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_16px_40px_-16px_rgba(255,152,69,0.5)] transition-all duration-500 ${
          cardsReady ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        } ${
          selectedMode === 'chatbot'
            ? 'pointer-events-none scale-[0.96] opacity-0 blur-[1px]'
            : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_44px_-16px_rgba(255,152,69,0.55)]'
        }`}
      >
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
            onClick={(event) => {
              event.stopPropagation();
              setSelectedMode('coding');
              setShowChatbotBot(false);
              void copyText('coding', codingInstruction);
            }}
            className="inline-flex rounded-xl bg-orange-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-100"
          >
            Copy coding instruction
          </button>
        </div>
      </article>

      <article
        onClick={() => setSelectedMode('chatbot')}
        className={`relative overflow-hidden rounded-3xl border border-cyan-300/45 bg-cyan-400/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_16px_40px_-16px_rgba(22,189,202,0.55)] transition-all duration-500 ${
          cardsReady ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        } ${
          selectedMode === 'coding'
            ? 'pointer-events-none scale-[0.96] opacity-0 blur-[1px]'
            : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_44px_-16px_rgba(22,189,202,0.6)]'
        }`}
      >
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
            onClick={(event) => {
              event.stopPropagation();
              setSelectedMode('chatbot');
              setShowChatbotBot(true);
              void copyText('chatbot', chatbotInstruction);
            }}
            className="inline-flex rounded-xl bg-cyan-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-100"
          >
            Copy chatbot instruction
          </button>
        </div>
      </article>

      {selectedMode ? (
        <div className="lg:col-span-2">
          <button
            type="button"
            onClick={() => {
              setSelectedMode(null);
              setShowChatbotBot(false);
            }}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Show both options again
          </button>
        </div>
      ) : null}

      {showChatbotBot ? (
        <section
          ref={chatbotBotRef}
          className="rounded-3xl border border-cyan-100/40 bg-cyan-200/15 p-5 shadow-[0_18px_54px_-24px_rgba(45,212,191,0.75)] ring-1 ring-cyan-100/20 transition-all duration-700 lg:col-span-2"
        >
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-cyan-100/25 bg-slate-950/45 p-3">
            <LobsterMascot
              variant="bubble"
              className="h-14 w-14 shrink-0 drop-shadow-[0_10px_12px_rgba(34,211,238,0.3)]"
            />
            <p className="text-sm text-cyan-50/95">
              I am ready. Paste the encoded chatbot output and I will decode it for your Agent Tea result.
            </p>
          </div>

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
