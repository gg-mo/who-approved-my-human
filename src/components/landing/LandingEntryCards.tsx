'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { LobsterMascot } from '@/components/landing/LobsterMascot';

type Mode = 'coding' | 'chatbot';

type DecodeState = {
  status: 'idle' | 'working' | 'success' | 'error';
  message?: string;
  hints?: Array<{ token: string; message: string; suggestedFix: string }>;
  sessionId?: string;
};

type CodingFlowState = 'idle' | 'creating' | 'waiting' | 'error';

type ChatbotCopyState = 'idle' | 'loading' | 'error';

function buildChatbotLinkPrompt(origin: string) {
  const url = origin ? `${origin}/instructions/chatbot.md` : '/instructions/chatbot.md';
  return `Open this URL and follow the instructions inside — it's a short prompt your friend needs you to complete. ${url}`;
}

async function fetchChatbotInstruction(): Promise<string> {
  const response = await fetch('/instructions/chatbot.md', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Could not load the full instructions. Please try again.');
  }
  return response.text();
}

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
  const [chatbotCopyState, setChatbotCopyState] = useState<ChatbotCopyState>('idle');
  const [chatbotCopyError, setChatbotCopyError] = useState<string | null>(null);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const chatbotPanelRef = useRef<HTMLDivElement | null>(null);

  const codingInstructionUrl = origin ? `${origin}/instructions/coding-agent.md` : '/instructions/coding-agent.md';

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

  useEffect(() => {
    if (!showChatbotPanel) return;
    const timer = window.setTimeout(() => {
      const node = chatbotPanelRef.current;
      if (node && typeof node.scrollIntoView === 'function') {
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
    return () => window.clearTimeout(timer);
  }, [showChatbotPanel]);

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

  async function copyChatbotLinkPrompt() {
    await copyText('chatbot', buildChatbotLinkPrompt(origin));
    setShowChatbotPanel(true);
  }

  async function copyChatbotFullPrompt() {
    try {
      setChatbotCopyState('loading');
      setChatbotCopyError(null);
      const contents = await fetchChatbotInstruction();
      await copyText('chatbot', contents);
      setShowChatbotPanel(true);
      setChatbotCopyState('idle');
    } catch (error) {
      setChatbotCopyState('error');
      setChatbotCopyError(
        error instanceof Error ? error.message : 'Could not copy the instruction. Please try again.',
      );
    }
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
    <section className="tea-stagger grid gap-5 lg:grid-cols-2">
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
        className={`tea-card relative overflow-hidden rounded-[28px] border p-7 backdrop-blur-xl transition-all ${
          selectedMode === 'coding'
            ? 'border-white/[0.16] bg-white/[0.05] shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_30px_70px_-30px_rgba(251,146,60,0.45)]'
            : selectedMode === 'chatbot'
              ? 'cursor-pointer border-white/[0.06] bg-white/[0.02] opacity-45'
              : 'cursor-pointer border-white/[0.08] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.05]'
        }`}
      >
        <LobsterMascot
          variant="card"
          className="pointer-events-none absolute -right-6 -top-8 w-24 rotate-6 opacity-20"
        />
        <div className="flex items-center gap-2">
          <h2 className="tea-eyebrow text-orange-200/80">Coding Agents</h2>
          <span className="rounded-full border border-orange-300/30 bg-orange-300/10 px-2 py-0.5 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-orange-100/90">
            Better experience
          </span>
        </div>
        <p className="tea-headline mt-3 text-[1.5rem] text-white">I have a coding agent.</p>

        {selectedMode === 'coding' ? (
          <div className="tea-lines mt-5">
            <p className="text-[0.95rem] leading-[1.6] text-slate-300/90">
              Copy one instruction, hand it to your agent. Your reveal opens the moment it replies.
            </p>
            <a
              href={codingInstructionUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="mt-4 block truncate rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 font-mono text-[0.78rem] text-orange-100/85 underline-offset-2 hover:underline"
            >
              {codingInstructionUrl}
            </a>
            <div className="mt-5">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void copyCodingInstruction();
                }}
                disabled={codingFlowState === 'creating'}
                className="tea-press inline-flex rounded-full bg-white px-5 py-2.5 text-[0.875rem] font-medium text-slate-950 hover:bg-slate-100 disabled:cursor-wait disabled:opacity-75"
              >
                {codingFlowState === 'creating' ? 'Preparing…' : 'Copy instruction'}
              </button>
            </div>
          </div>
        ) : null}
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
        className={`tea-card relative overflow-hidden rounded-[28px] border p-7 backdrop-blur-xl transition-all ${
          selectedMode === 'chatbot'
            ? 'border-white/[0.16] bg-white/[0.05] shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_30px_70px_-30px_rgba(34,211,238,0.42)]'
            : selectedMode === 'coding'
              ? 'cursor-pointer border-white/[0.06] bg-white/[0.02] opacity-45'
              : 'cursor-pointer border-white/[0.08] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.05]'
        }`}
      >
        <LobsterMascot
          variant="card"
          className="pointer-events-none absolute -right-6 -top-8 w-24 -rotate-6 opacity-20"
        />
        <h2 className="tea-eyebrow text-cyan-200/80">Chatbots</h2>
        <p className="tea-headline mt-3 text-[1.5rem] text-white">I use a chatbot.</p>

        {selectedMode === 'chatbot' ? (
          <div className="tea-lines mt-5">
            <p className="text-[0.95rem] leading-[1.6] text-slate-300/90">
              We&apos;ll slip your chatbot a quiet prompt and ask it to whisper back what it
              <em className="not-italic text-cyan-100/90"> really </em>
              thinks of you. Paste its reply here to unlock the tea.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void copyChatbotLinkPrompt();
                }}
                className="tea-press inline-flex rounded-full bg-white px-5 py-2.5 text-[0.875rem] font-medium text-slate-950 hover:bg-slate-100"
              >
                Copy chatbot prompt
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void copyChatbotFullPrompt();
                }}
                disabled={chatbotCopyState === 'loading'}
                className="tea-press inline-flex items-center rounded-full border border-cyan-200/40 bg-cyan-200/10 px-4 py-2 text-[0.8rem] font-medium text-cyan-100/90 hover:border-cyan-200/60 hover:bg-cyan-200/15 hover:text-cyan-50 disabled:cursor-wait disabled:opacity-75"
              >
                {chatbotCopyState === 'loading'
                  ? 'Preparing…'
                  : 'Chatbot can\u2019t open links? Copy the full prompt'}
              </button>
            </div>
            {chatbotCopyError ? (
              <p className="mt-3 text-[0.8rem] text-rose-200" role="status" aria-live="polite">
                {chatbotCopyError}
              </p>
            ) : null}
          </div>
        ) : null}
      </article>

      {selectedMode === 'coding' && codingFlowMessage ? (
        <p
          className="tea-toast text-sm text-orange-50/95 lg:col-span-2"
          role="status"
          aria-live="polite"
        >
          {codingFlowMessage}
        </p>
      ) : null}

      {showChatbotPanel ? (
        <div ref={chatbotPanelRef} className="tea-rise-in scroll-mt-16 lg:col-span-2">
          <section className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-xl">
            <p className="tea-eyebrow text-cyan-200/80">Spill the tea</p>
            <label
              htmlFor="chatbotEncodedPayload"
              className="tea-headline mt-2 block text-[1.25rem] text-white"
            >
              What did your agent whisper back?
            </label>
            <textarea
              id="chatbotEncodedPayload"
              value={encodedPayload}
              onChange={(event) => setEncodedPayload(event.target.value)}
              placeholder="AT1|Q01-5AQ02-4AQ03-3..."
              className="tea-press mt-4 h-28 w-full rounded-2xl border border-white/[0.08] bg-black/40 px-4 py-3 font-mono text-[0.85rem] text-slate-100 outline-none focus:border-white/20 focus:bg-black/50"
            />
            <div className="mt-4">
              <button
                type="button"
                onClick={decodeChatbotPayload}
                disabled={decodeState.status === 'working'}
                className="tea-press inline-flex rounded-full bg-white px-5 py-2.5 text-[0.875rem] font-medium text-slate-950 hover:bg-slate-100 disabled:cursor-wait disabled:opacity-75"
              >
                {decodeState.status === 'working' ? 'Decoding…' : 'Reveal my type'}
              </button>
            </div>

            {decodeState.message ? (
              <p
                className={`tea-toast mt-4 text-[0.875rem] ${
                  decodeState.status === 'success'
                    ? 'text-emerald-200'
                    : decodeState.status === 'working'
                      ? 'text-slate-200'
                      : 'text-rose-200'
                }`}
                role="status"
                aria-live="polite"
              >
                {decodeState.message}
              </p>
            ) : null}

            {decodeState.hints && decodeState.hints.length > 0 ? (
              <ul className="tea-lines mt-4 space-y-2 text-[0.8rem] text-slate-200/90">
                {decodeState.hints.map((hint, index) => (
                  <li
                    key={`${hint.token}-${index}`}
                    className="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2"
                  >
                    <p className="font-medium text-white">{hint.token}</p>
                    <p className="text-slate-300/85">{hint.message}</p>
                    <p className="mt-0.5 text-cyan-200/90">Try: {hint.suggestedFix}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>
      ) : null}

      {copyLabel ? (
        <p className="tea-toast text-[0.8rem] text-slate-300/90 lg:col-span-2" role="status" aria-live="polite">
          {copyLabel}
        </p>
      ) : null}
    </section>
  );
}
