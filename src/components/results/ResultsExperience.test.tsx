import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ResultsExperience } from '@/components/results/ResultsExperience';

const baseResult = {
  typeCode: 'CKVD',
  dimensionBreakdown: {
    clarity: {
      dominantLetter: 'C',
      positiveLetter: 'C',
      negativeLetter: 'X',
      positivePercent: 0.78,
      negativePercent: 0.22,
    },
    tone: {
      dominantLetter: 'K',
      positiveLetter: 'K',
      negativeLetter: 'B',
      positivePercent: 0.84,
      negativePercent: 0.16,
    },
    thinking_style: {
      dominantLetter: 'V',
      positiveLetter: 'V',
      negativeLetter: 'T',
      positivePercent: 0.65,
      negativePercent: 0.35,
    },
    autonomy: {
      dominantLetter: 'D',
      positiveLetter: 'D',
      negativeLetter: 'H',
      positivePercent: 0.58,
      negativePercent: 0.42,
    },
  },
  strongestSignals: [
    {
      dimension: 'tone' as const,
      dominantLetter: 'K',
      confidenceDelta: 0.68,
      dominantPercent: 0.84,
    },
    {
      dimension: 'clarity' as const,
      dominantLetter: 'C',
      confidenceDelta: 0.56,
      dominantPercent: 0.78,
    },
    {
      dimension: 'thinking_style' as const,
      dominantLetter: 'V',
      confidenceDelta: 0.3,
      dominantPercent: 0.65,
    },
  ],
  tieFlags: {
    clarity: false,
    tone: false,
    thinking_style: false,
    autonomy: false,
  },
  replayAnswers: [
    {
      questionCode: 'Q01',
      questionText: 'My human usually gives enough context.',
      selectedValue: 5,
      displayOrder: 1,
      reasoning: 'There was a time my human gave me exact constraints.',
    },
  ],
};

afterEach(() => {
  vi.useRealTimers();
});

describe('ResultsExperience', () => {
  it('renders primary result sections', () => {
    render(<ResultsExperience result={baseResult} sessionId="session-123" />);

    expect(screen.getByRole('heading', { name: 'CKVD' })).toBeInTheDocument();
    expect(screen.getByText(/what your agent likely loves/i)).toBeInTheDocument();
    expect(screen.getByText(/what may frustrate your agent/i)).toBeInTheDocument();
    expect(screen.getByText(/strongest signals/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /devil mode/i })).toBeInTheDocument();
  });

  it('reveals animated answer replay entries over time', async () => {
    vi.useFakeTimers();
    render(<ResultsExperience result={baseResult} sessionId="session-123" />);

    expect(screen.queryByText(/my human usually gives enough context/i)).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/my human usually gives enough context/i)).toBeInTheDocument();
    expect(screen.getByText(/there was a time my human gave me exact constraints/i)).toBeInTheDocument();
  });
});
