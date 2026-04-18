'use client';

import { useEffect, useMemo, useState } from 'react';

import { LobsterMascot } from '@/components/landing/LobsterMascot';

type Mode = 'coding' | 'chatbot';

type DecodeState = {
  status: 'idle' | 'working' | 'success' | 'error';
  message?: string;
  hints?: Array<{ token: string; message: string; suggestedFix: string }>;
  sessionId?: string;
};

type CodingFlowState = 'idle' | 'creating' | 'waiting' | 'error';

const chatbotInstruction = 'follow the instruction in this file: /instructions/chatbot.md';

function getReferralContext() {
  const referralCode = localStorage.getItem('agentTeaReferral') ?? undefined;
  const referrerSessionId = referralCode && /^[0-9a-f-]{36}$/i.test(referralCode) ? referralCode : undefined;

  return { referralCode, referrerSessionId };
}

export function LandingEntryCards() {
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [showChatbotPanel, setShowChatbotPanel] = useState(false);
  const [copiedKey, setCopiedKey] = useState<Mode | null>(null);
  const [encodedPayload, setEncodedPayload] = useState('');
  const [decodeState, setDecodeState] = useState<DecodeState>({ status: 'idle' });
  const [codingSessionId, setCodingSessionId] = useState<string | null>(null);
  const [codingFlowState, setCodingFlowState] = useState<CodingFlowState>('idle');
  const [codingFlowMessage, setCodingFlowMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!codingSessionId || selectedMode !== 'coding') {
      return;
    }

    let cancelled = false;
    let timer: number | null = null;

    const poll = async () => {
      try {
        const response = await fetch(`/api/sessions/${codingSessionId}/result`, { cache: 'no-store' });

        if (response.ok) {
          if (!cancelled) {
            window.location.assign(`/results/${codingSessionId}`);
          }
          return;
        }

        if (response.status !== 404 && !cancelled) {
          setCodingFlowMessage('Almost there — your reveal will open as soon as it arrives.');
        }
      } catch {
        if (!cancelled) {
          setCodingFlowMessage('Still waiting on your agent. We&apos;ll refresh the moment it replies.');
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
    if (!copiedKey) return null;
    if (copiedKey === 'coding') return 'Copied — paste this into your coding agent.';
    return 'Copied — paste this into your chatbot.';
  }, [copiedKey]);

  async function copyText(key: Mode, value: string) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    }
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1800);
  }

  async function ensureCodingSession() {
    if (codingSessionId) return codingSessionId;

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
      throw new Error(sessionData.error ?? 'Could not start a new round. Please try again.');
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
      setCodingFlowMessage('Preparing your private round…');

      const sessionId = await ensureCodingSession();
      await copyText('coding', buildCodingInstruction(sessionId));

      setCodingFlowState('waiting');
      setCodingFlowMessage('Copied. Paste it to your coding agent — your reveal opens automatically.');
    } catch (error) {
      setCodingFlowState('error');
      setCodingFlowMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      );
    }
  }

  async function checkCodingSubmissionNow() {
    if (!codingSessionId) return;

    try {
      const response = await fetch(`/api/sessions/${codingSessionId}/result`, { cache: 'no-store' });

      if (response.ok) {
        window.location.assign(`/results/${codingSessionId}`);
        return;
      }

      setCodingFlowMessage('No reply yet. Ask your agent to run the pasted instruction.');
    } catch {
      setCodingFlowMessage('Could not check just now. Try again in a moment.');
    }
  }

  async function decodeChatbotPayload() {
    const payload = encodedPayload.trim();

    if (!payload) {
      setDecodeState({
        status: 'error',
        message: 'Paste the reply from your chatbot first.',
      });
      return;
    }

    setDecodeState({ status: 'working', message: 'Decoding your reply…' });

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
        throw new Error(sessionData.error ?? 'Could not start a new round. Please try again.');
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
          message: 'That reply needs a small fix. See tips below.',
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
        message: 'Decoded. Opening your reveal…',
      });

      await fetch(`/api/sessions/${sessionData.sessionId}/score`, { method: 'POST' });
      void fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName: 'chatbot_flow_completed', sessionId: sessionData.sessionId }),
      }).catch(() => undefined);

      window.location.assign(`/results/${sessionData.sessionId}`);
    } catch (error) {
      setDecodeState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Could not read that reply. Please try again.',
      });
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article
        onClick={() => {
          if (selectedMode === 'coding') {
            setSelectedMode(null);
            setShowChatbotPanel(false);
            return;
          }
          setSelectedMode('coding');
          setShowChatbotPanel(false);
        }}
        className={`tea-card relative overflow-hidden rounded-3xl border p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_16px_40px_-16px_rgba(255,152,69,0.45)] ${
          selectedMode === 'coding'
            ? 'border-orange-200/70 bg-orange-400/20 shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_28px_56px_-18px_rgba(255,152,69,0.65)]'
            : selectedMode === 'chatbot'
              ? 'cursor-pointer border-orange-300/25 bg-orange-400/5 opacity-60'
              : 'cursor-pointer border-orange-300/40 bg-orange-400/10 hover:border-orange-200/60'
        }`}
      >
        <LobsterMascot
          variant="card"
          className="pointer-events-none absolute -right-6 -top-8 w-28 rotate-6 opacity-35"
        />
        <h2 className="text-xl font-bold text-orange-100">Coding Agents</h2>
        <p className="mt-2 text-sm leading-6 text-orange-50/85">
          Paste one tiny instruction into your coding agent. It runs the quiz for you and your reveal opens
          the moment it replies.
        </p>
        <code className="mt-4 block rounded-2xl border border-orange-200/30 bg-black/30 px-3 py-2 text-xs text-orange-50">
          follow instructions in /instructions/coding-agent.md
        </code>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedMode('coding');
              setShowChatbotPanel(false);
              void copyCodingInstruction();
            }}
            disabled={codingFlowState === 'creating'}
            className="tea-press inline-flex rounded-xl bg-orange-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-orange-100 disabled:cursor-wait disabled:opacity-75"
          >
            {codingFlowState === 'creating' ? 'Preparing…' : 'Copy coding instruction'}
          </button>
        </div>
      </article>

      <article
        onClick={() => {
          if (selectedMode === 'chatbot') {
            setSelectedMode(null);
            setShowChatbotPanel(false);
            return;
          }
          setSelectedMode('chatbot');
        }}
        className={`tea-card relative overflow-hidden rounded-3xl border p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_16px_40px_-16px_rgba(22,189,202,0.5)] ${
          selectedMode === 'chatbot'
            ? 'border-cyan-200/70 bg-cyan-400/20 shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_28px_56px_-18px_rgba(22,189,202,0.65)]'
            : selectedMode === 'coding'
              ? 'cursor-pointer border-cyan-300/25 bg-cyan-400/5 opacity-60'
              : 'cursor-pointer border-cyan-300/45 bg-cyan-400/10 hover:border-cyan-200/65'
        }`}
      >
        <LobsterMascot
          variant="card"
          className="pointer-events-none absolute -right-6 -top-8 w-28 -rotate-6 opacity-35"
        />
        <h2 className="text-xl font-bold text-cyan-100">Chatbots</h2>
        <p className="mt-2 text-sm leading-6 text-cyan-50/85">
          Paste a prompt into ChatGPT, Claude, or Gemini. Bring back its short reply and we&apos;ll unlock your
          reveal here.
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
              setShowChatbotPanel(true);
              void copyText('chatbot', chatbotInstruction);
            }}
            className="tea-press inline-flex rounded-xl bg-cyan-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-100"
          >
            Copy chatbot instruction
          </button>
        </div>
      </article>

      {selectedMode === 'coding' ? (
        <div className="tea-rise-in lg:col-span-2">
          <section className="mt-1 rounded-3xl border border-orange-100/35 bg-orange-200/15 p-5 shadow-[0_18px_54px_-24px_rgba(251,146,60,0.7)] ring-1 ring-orange-100/20">
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-orange-100/25 bg-slate-950/45 p-3">
              <LobsterMascot
                variant="bubble"
                className="h-14 w-14 shrink-0 drop-shadow-[0_10px_12px_rgba(251,146,60,0.3)]"
              />
              <p className="text-sm text-orange-50/95">
                Hand the copied instruction to your coding agent. Your reveal opens the second it replies — you
                don&apos;t have to come back here to refresh.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void copyCodingInstruction()}
                disabled={codingFlowState === 'creating'}
                className="tea-press inline-flex rounded-xl bg-orange-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-orange-100 disabled:cursor-wait disabled:opacity-75"
              >
                {codingFlowState === 'creating' ? 'Preparing…' : 'Copy instruction again'}
              </button>

              <button
                type="button"
                onClick={checkCodingSubmissionNow}
                disabled={!codingSessionId}
                className="tea-press inline-flex rounded-xl border border-orange-100/45 bg-orange-100/10 px-4 py-2 text-sm font-semibold text-orange-50 hover:bg-orange-100/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                I already pasted it
              </button>

              {codingSessionId ? (
                <a
                  href={`/results/${codingSessionId}`}
                  className="tea-press inline-flex rounded-xl border border-orange-100/45 bg-orange-100/10 px-4 py-2 text-sm font-semibold text-orange-50 hover:bg-orange-100/20"
                >
                  Open my reveal
                </a>
              ) : null}
            </div>

            {codingFlowMessage ? (
              <p className="tea-toast mt-3 text-sm text-orange-50/95">{codingFlowMessage}</p>
            ) : null}
          </section>
        </div>
      ) : null}

      {showChatbotPanel ? (
        <div className="tea-rise-in lg:col-span-2">
          <section className="mt-1 rounded-3xl border border-cyan-100/40 bg-cyan-200/15 p-5 shadow-[0_18px_54px_-24px_rgba(45,212,191,0.75)] ring-1 ring-cyan-100/20">
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-cyan-100/25 bg-slate-950/45 p-3">
              <LobsterMascot
                variant="bubble"
                className="h-14 w-14 shrink-0 drop-shadow-[0_10px_12px_rgba(34,211,238,0.3)]"
              />
              <p className="text-sm text-cyan-50/95">
                Ready when you are. Paste the short reply your chatbot gave you and we&apos;ll open your reveal.
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
              className="mt-2 h-28 w-full rounded-2xl border border-cyan-100/25 bg-slate-950/70 px-3 py-2 text-sm text-cyan-50 outline-none transition focus:border-cyan-200/60"
            />
            <button
              type="button"
              onClick={decodeChatbotPayload}
              disabled={decodeState.status === 'working'}
              className="tea-press mt-3 inline-flex rounded-xl bg-cyan-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-100 disabled:cursor-wait disabled:opacity-75"
            >
              {decodeState.status === 'working' ? 'Decoding…' : 'Reveal my type'}
            </button>

            {decodeState.message ? (
              <p
                className={`tea-toast mt-3 text-sm ${
                  decodeState.status === 'success'
                    ? 'text-emerald-200'
                    : decodeState.status === 'working'
                      ? 'text-cyan-100'
                      : 'text-rose-200'
                }`}
                role="status"
                aria-live="polite"
              >
                {decodeState.message}
              </p>
            ) : null}

            {decodeState.hints && decodeState.hints.length > 0 ? (
              <ul className="mt-3 space-y-2 text-xs text-cyan-50/90">
                {decodeState.hints.map((hint, index) => (
                  <li
                    key={`${hint.token}-${index}`}
                    className="tea-rise-in rounded-xl border border-cyan-100/20 bg-black/20 p-2"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <p className="font-semibold">{hint.token}</p>
                    <p>{hint.message}</p>
                    <p className="text-cyan-200/90">Try: {hint.suggestedFix}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>
      ) : null}

      {copyLabel ? (
        <p className="tea-toast text-xs text-cyan-100 lg:col-span-2" role="status" aria-live="polite">
          {copyLabel}
        </p>
      ) : null}
    </section>
  );
}
