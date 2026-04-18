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

type CodingFlowState = 'idle' | 'creating' | 'waiting' | 'error';

const chatbotInstruction = 'follow the instruction in this file: /instructions/chatbot.md';

function getReferralContext() {
  const referralCode = localStorage.getItem('agentTeaReferral') ?? undefined;
  const referrerSessionId = referralCode && /^[0-9a-f-]{36}$/i.test(referralCode) ? referralCode : undefined;

  return {
    referralCode,
    referrerSessionId,
  };
}

export function LandingEntryCards() {
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [cardsReady, setCardsReady] = useState(false);
  const [showChatbotBot, setShowChatbotBot] = useState(false);
  const [copiedKey, setCopiedKey] = useState<Mode | null>(null);
  const [encodedPayload, setEncodedPayload] = useState('');
  const [decodeState, setDecodeState] = useState<DecodeState>({ status: 'idle' });
  const [codingSessionId, setCodingSessionId] = useState<string | null>(null);
  const [codingFlowState, setCodingFlowState] = useState<CodingFlowState>('idle');
  const [codingFlowMessage, setCodingFlowMessage] = useState<string | null>(null);
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

  useEffect(() => {
    if (!codingSessionId || selectedMode !== 'coding') {
      return;
    }

    let cancelled = false;
    let timer: number | null = null;

    const poll = async () => {
      try {
        const response = await fetch(`/api/sessions/${codingSessionId}/result`, {
          cache: 'no-store',
        });

        if (response.ok) {
          if (!cancelled) {
            window.location.assign(`/results/${codingSessionId}`);
          }
          return;
        }

        if (response.status !== 404 && !cancelled) {
          setCodingFlowMessage('Session found, still processing. We will refresh automatically.');
        }
      } catch {
        if (!cancelled) {
          setCodingFlowMessage('Waiting for submission… if your agent already posted, this will update soon.');
        }
      }

      if (!cancelled) {
        timer = window.setTimeout(poll, 2800);
      }
    };

    timer = window.setTimeout(poll, 1800);

    return () => {
      cancelled = true;
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [codingSessionId, selectedMode]);

  const copyLabel = useMemo(() => {
    if (!copiedKey) {
      return null;
    }

    if (copiedKey === 'coding') {
      return 'Copied coding instruction with a live session ID.';
    }

    return 'Copied chatbot instruction';
  }, [copiedKey]);

  async function copyText(key: Mode, value: string) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    }

    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1700);
  }

  async function ensureCodingSession() {
    if (codingSessionId) {
      return codingSessionId;
    }

    const referral = getReferralContext();
    const sessionResponse = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intakeMode: 'coding_agent',
        referralCode: referral.referralCode,
        referrerSessionId: referral.referrerSessionId,
      }),
    });
    const sessionData = await sessionResponse.json();

    if (!sessionResponse.ok || !sessionData.sessionId) {
      throw new Error(sessionData.error ?? 'Failed to create coding-agent session.');
    }

    setCodingSessionId(sessionData.sessionId);
    return sessionData.sessionId as string;
  }

  function buildCodingInstruction(sessionId: string) {
    const site = window.location.origin;
    const instructionUrl = `${site}/instructions/coding-agent.md`;

    return [
      `Follow the instructions in this file: ${instructionUrl}`,
      '',
      `Use this exact sessionId: ${sessionId}`,
      `Use this site value: ${site}`,
      '',
      'After generating the JSON, send it directly with this cURL request:',
      `curl -X POST "${site}/api/sessions/${sessionId}/ingest-coding-agent" \\\n  -H "Content-Type: application/json" \\\n  --data '<json-from-above>'`,
      '',
      'Do not ask me to submit manually. Submit it yourself and then tell me it was sent.',
    ].join('\n');
  }

  async function copyCodingInstruction() {
    try {
      setCodingFlowState('creating');
      setCodingFlowMessage('Creating your unique coding-agent session…');

      const sessionId = await ensureCodingSession();
      await copyText('coding', buildCodingInstruction(sessionId));

      setCodingFlowState('waiting');
      setCodingFlowMessage('Instruction copied. Waiting for your coding agent to submit answers via HTTP.');
    } catch (error) {
      setCodingFlowState('error');
      setCodingFlowMessage(
        error instanceof Error ? error.message : 'Could not create coding session. Please try again.',
      );
    }
  }

  async function checkCodingSubmissionNow() {
    if (!codingSessionId) {
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${codingSessionId}/result`, {
        cache: 'no-store',
      });

      if (response.ok) {
        window.location.assign(`/results/${codingSessionId}`);
        return;
      }

      setCodingFlowMessage('No submission yet. Ask your coding agent to run the cURL step in the prompt.');
    } catch {
      setCodingFlowMessage('Could not check submission right now. Please retry in a moment.');
    }
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
      const referral = getReferralContext();

      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intakeMode: 'chatbot',
          referralCode: referral.referralCode,
          referrerSessionId: referral.referrerSessionId,
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
          if (selectedMode === 'coding') {
            setSelectedMode(null);
            setShowChatbotBot(false);
            return;
          }

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
          We generate a unique session ID, your coding agent submits JSON via HTTP, then your result appears on Agent
          Tea.
        </p>
        <code className="mt-4 block rounded-2xl border border-orange-200/30 bg-black/30 px-3 py-2 text-xs text-orange-50">
          follow instructions in /instructions/coding-agent.md, then POST to /api/sessions/&lt;sessionId&gt;/ingest-coding-agent
        </code>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedMode('coding');
              setShowChatbotBot(false);
              void copyCodingInstruction();
            }}
            disabled={codingFlowState === 'creating'}
            className="inline-flex rounded-xl bg-orange-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-100 disabled:cursor-wait disabled:opacity-75"
          >
            {codingFlowState === 'creating' ? 'Preparing session…' : 'Copy coding instruction'}
          </button>
        </div>
      </article>

      <article
        onClick={() => {
          if (selectedMode === 'chatbot') {
            setSelectedMode(null);
            setShowChatbotBot(false);
            return;
          }

          setSelectedMode('chatbot');
        }}
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

      {selectedMode === 'coding' ? (
        <section className="rounded-3xl border border-orange-100/35 bg-orange-200/15 p-5 shadow-[0_18px_54px_-24px_rgba(251,146,60,0.7)] ring-1 ring-orange-100/20 transition-all duration-700 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-orange-100/25 bg-slate-950/45 p-3">
            <LobsterMascot
              variant="bubble"
              className="h-14 w-14 shrink-0 drop-shadow-[0_10px_12px_rgba(251,146,60,0.3)]"
            />
            <p className="text-sm text-orange-50/95">
              Send the copied instruction to your coding agent. It should submit answers by HTTP and I will auto-open
              your result page.
            </p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-orange-100/20 bg-black/20 p-3 text-xs text-orange-50/95 sm:grid-cols-2">
            <div>
              <p className="font-semibold text-orange-100">Session ID</p>
              <p className="mt-1 break-all font-mono">{codingSessionId ?? 'Will generate on copy'}</p>
            </div>
            <div>
              <p className="font-semibold text-orange-100">Submit endpoint</p>
              <p className="mt-1 break-all font-mono">
                {codingSessionId
                  ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api/sessions/${codingSessionId}/ingest-coding-agent`
                  : '/api/sessions/<sessionId>/ingest-coding-agent'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                void copyCodingInstruction();
              }}
              disabled={codingFlowState === 'creating'}
              className="inline-flex rounded-xl bg-orange-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-100 disabled:cursor-wait disabled:opacity-75"
            >
              {codingFlowState === 'creating' ? 'Preparing session…' : 'Copy instruction again'}
            </button>

            <button
              type="button"
              onClick={checkCodingSubmissionNow}
              disabled={!codingSessionId}
              className="inline-flex rounded-xl border border-orange-100/45 bg-orange-100/10 px-4 py-2 text-sm font-semibold text-orange-50 transition hover:bg-orange-100/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Check submission now
            </button>

            {codingSessionId ? (
              <a
                href={`/results/${codingSessionId}`}
                className="inline-flex rounded-xl border border-orange-100/45 bg-orange-100/10 px-4 py-2 text-sm font-semibold text-orange-50 transition hover:bg-orange-100/20"
              >
                Open result URL
              </a>
            ) : null}
          </div>

          {codingFlowMessage ? <p className="mt-3 text-sm text-orange-50/95">{codingFlowMessage}</p> : null}
        </section>
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
