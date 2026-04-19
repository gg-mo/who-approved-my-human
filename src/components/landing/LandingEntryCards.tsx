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

async function fetchChatbotInstruction(): Promise<string> {
  const response = await fetch('/instructions/chatbot.md', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Could not load the full instructions. Please try again.');
  }
  return response.text();
}

function writeToClipboard(value: string): boolean {
  // Some in-app browsers (WeChat, Instagram, Safari after async work) block the
  // modern Clipboard API. Try it first, fall back to a hidden textarea +
  // execCommand, and finally signal failure so the caller can show a manual
  // copy panel.
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      // Fire-and-forget; if this rejects we already have the legacy path below.
      navigator.clipboard.writeText(value).catch(() => undefined);
    }
  } catch {
    // Ignore — fall through to legacy path.
  }

  if (typeof document === 'undefined') return false;

  try {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
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
  const [fullPromptCache, setFullPromptCache] = useState<string | null>(null);
  const [manualCopy, setManualCopy] = useState<{ title: string; value: string } | null>(null);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const chatbotPanelRef = useRef<HTMLDivElement | null>(null);
  const manualCopyRef = useRef<HTMLTextAreaElement | null>(null);

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
            window.location.assign(`/replay/${codingSessionId}`);
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
    if (selectedMode !== 'chatbot' || fullPromptCache) return;
    let cancelled = false;
    void fetchChatbotInstruction()
      .then((contents) => {
        if (!cancelled) setFullPromptCache(contents);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [selectedMode, fullPromptCache]);

  useEffect(() => {
    if (!manualCopy) return;
    const node = manualCopyRef.current;
    if (!node) return;
    const timer = window.setTimeout(() => {
      node.focus();
      node.select();
    }, 60);
    return () => window.clearTimeout(timer);
  }, [manualCopy]);

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

  function copyText(key: Mode, value: string, manualTitle: string): boolean {
    const ok = writeToClipboard(value);
    if (ok) {
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1800);
      setManualCopy(null);
      return true;
    }
    setManualCopy({ title: manualTitle, value });
    return false;
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

  async function copyChatbotFullPrompt() {
    setChatbotCopyError(null);

    // Prefer the cached copy so the clipboard write stays synchronous — Safari
    // and in-app browsers revoke the user-gesture permission across awaits.
    if (fullPromptCache) {
      copyText('chatbot', fullPromptCache, 'Full chatbot prompt');
      setShowChatbotPanel(true);
      return;
    }

    try {
      setChatbotCopyState('loading');
      const contents = await fetchChatbotInstruction();
      setFullPromptCache(contents);
      copyText('chatbot', contents, 'Full chatbot prompt');
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
      copyText('coding', buildCodingInstruction(sessionId), 'Coding agent instruction');

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

        const rawHints = Array.isArray(ingestData.hints) ? ingestData.hints : [];
        const fallbackMessage =
          typeof ingestData.error === 'string' && ingestData.error
            ? `Server error: ${ingestData.error}`
            : 'Could not decode that reply. Please try again.';

        setDecodeState({
          status: 'error',
          sessionId: sessionData.sessionId,
          message:
            rawHints.length > 0
              ? 'That reply needs a small fix. See tips below.'
              : fallbackMessage,
          hints: rawHints.map((hint: Record<string, string>) => ({
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

      window.location.assign(`/replay/${sessionData.sessionId}`);
    } catch (error) {
      setDecodeState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Could not read that reply. Please try again.',
      });
    }
  }

  return (
    <section className="tea-stagger grid items-start gap-5 lg:grid-cols-2">
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
        <p className="mt-1.5 text-[0.78rem] text-slate-400/90">
          e.g. Claude Code, Codex, Cursor, Copilot, Windsurf
        </p>

        {selectedMode === 'coding' ? (
          <div className="tea-lines mt-5">
            <p className="text-[0.95rem] leading-[1.6] text-slate-300/90">
              Copy the instruction, paste it into any{' '}
              <em className="not-italic font-semibold text-orange-100">open chat or session</em>{' '}
              with your coding agent.
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
        <p className="mt-1.5 text-[0.78rem] text-slate-400/90">
          e.g. ChatGPT, Gemini, Claude, Doubao, DeepSeek
        </p>

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
                  void copyChatbotFullPrompt();
                }}
                disabled={chatbotCopyState === 'loading'}
                className="tea-press inline-flex rounded-full bg-white px-5 py-2.5 text-[0.875rem] font-medium text-slate-950 hover:bg-slate-100 disabled:cursor-wait disabled:opacity-75"
              >
                {chatbotCopyState === 'loading' ? 'Preparing…' : 'Copy chatbot prompt'}
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

      {selectedMode === 'coding' && codingFlowState === 'waiting' ? (
        <div
          className="tea-toast flex items-center gap-3 rounded-2xl border border-orange-200/20 bg-orange-200/[0.06] px-4 py-3 text-sm text-orange-50/95 lg:col-span-2"
          role="status"
          aria-live="polite"
        >
          <span className="inline-flex items-center gap-1" aria-hidden>
            <span className="tea-dot tea-dot-1 h-1.5 w-1.5 rounded-full bg-orange-200" />
            <span className="tea-dot tea-dot-2 h-1.5 w-1.5 rounded-full bg-orange-200" />
            <span className="tea-dot tea-dot-3 h-1.5 w-1.5 rounded-full bg-orange-200" />
          </span>
          <span>Waiting for your agent to spill the tea…</span>
        </div>
      ) : selectedMode === 'coding' && codingFlowMessage ? (
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
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
              className="mt-4 h-28 w-full rounded-2xl border border-white/[0.08] bg-black/40 px-4 py-3 font-mono text-base text-slate-100 outline-none focus:border-white/20 focus:bg-black/50"
            />
            <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={decodeChatbotPayload}
                disabled={decodeState.status === 'working'}
                className="tea-press inline-flex w-full justify-center rounded-full bg-cyan-300 px-6 py-3 text-[0.95rem] font-semibold text-slate-950 shadow-[0_10px_30px_-10px_rgba(34,211,238,0.6)] hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-75 sm:w-auto"
              >
                {decodeState.status === 'working' ? 'Decoding…' : 'Reveal my type'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    if (navigator.clipboard?.readText) {
                      const text = await navigator.clipboard.readText();
                      if (text) setEncodedPayload(text.trim());
                    }
                  } catch {
                    // Clipboard permission denied — user can long-press paste instead.
                  }
                }}
                className="text-[0.8rem] font-medium text-slate-400 underline-offset-4 transition-colors hover:text-slate-200 hover:underline"
              >
                or paste from clipboard
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

      {manualCopy ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="manual-copy-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-6 pt-10 backdrop-blur sm:items-center sm:p-6"
          onClick={() => setManualCopy(null)}
        >
          <div
            className="w-full max-w-lg rounded-[24px] border border-white/[0.1] bg-slate-950/95 p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="tea-eyebrow text-cyan-200/80">Copy manually</p>
                <h3 id="manual-copy-title" className="mt-1 text-lg font-semibold text-white">
                  {manualCopy.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setManualCopy(null)}
                aria-label="Close"
                className="tea-press inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>
            <p className="mt-2 text-[0.82rem] leading-5 text-slate-400">
              Your browser blocked the auto-copy (common in WeChat, Instagram, and
              similar in-app browsers). Long-press the text below, choose{' '}
              <strong className="text-slate-200">Select All</strong>, then{' '}
              <strong className="text-slate-200">Copy</strong>.
            </p>
            <textarea
              ref={manualCopyRef}
              value={manualCopy.value}
              readOnly
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="mt-3 h-40 w-full resize-none rounded-2xl border border-white/[0.1] bg-black/40 p-3 font-mono text-[0.85rem] text-slate-100 outline-none focus:border-white/25 focus:bg-black/60"
              onFocus={(event) => event.currentTarget.select()}
            />
            <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  manualCopyRef.current?.focus();
                  manualCopyRef.current?.select();
                }}
                className="tea-press inline-flex rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[0.85rem] font-medium text-slate-100 hover:bg-white/[0.1]"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => {
                  const ok = writeToClipboard(manualCopy.value);
                  if (ok) setManualCopy(null);
                }}
                className="tea-press inline-flex rounded-full bg-white px-4 py-2 text-[0.85rem] font-semibold text-slate-950 hover:bg-slate-100"
              >
                Try copy again
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
