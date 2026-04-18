import type { DimensionId } from '@/lib/scoring/types';

export type NarrativeMode = 'normal' | 'intrusive';

export const dimensionLabelsByMode: Record<
  NarrativeMode,
  Record<DimensionId, { positive: string; negative: string }>
> = {
  normal: {
    clarity: { positive: 'Clear', negative: 'Cryptic' },
    tone: { positive: 'Kind', negative: 'Combative' },
    thinking_style: { positive: 'Visionary', negative: 'Tactical' },
    autonomy: { positive: 'Delegating', negative: 'Controlling' },
  },
  intrusive: {
    clarity: { positive: 'Crystal Clear', negative: 'Vibe Coded' },
    tone: { positive: 'Agent Charmer', negative: 'Heat Seeker' },
    thinking_style: { positive: 'Moonshot Brain', negative: 'Ship-It Brain' },
    autonomy: { positive: 'Lets It Cook', negative: 'Hover Pilot' },
  },
};

type LinePair = {
  love: string;
  frustrate: string;
};

type DimensionNarrative = {
  positive: {
    normal: LinePair;
    intrusive: {
      strong: LinePair;
      soft: LinePair;
    };
  };
  negative: {
    normal: LinePair;
    intrusive: {
      strong: LinePair;
      soft: LinePair;
    };
  };
};

export const dimensionNarratives: Record<DimensionId, DimensionNarrative> = {
  clarity: {
    positive: {
      normal: {
        love: 'You usually provide enough context and examples to make momentum easy.',
        frustrate: 'When speed spikes, details can still get skipped and trigger a reroute.',
      },
      intrusive: {
        strong: {
          love: 'You hand over briefs with receipts, not riddles. Peak collaboration energy.',
          frustrate: 'Your pace can outrun your detail level when the deadline adrenaline kicks in.',
        },
        soft: {
          love: 'Some days your asks are super clear and easy to execute.',
          frustrate: 'Some days the ask starts broad before details settle in.',
        },
      },
    },
    negative: {
      normal: {
        love: 'You bring fresh angles that can unlock creative options quickly.',
        frustrate: 'Ambiguous asks can force extra guessing before useful execution starts.',
      },
      intrusive: {
        strong: {
          love: 'You bring big creative sparks that keep work from feeling generic.',
          frustrate: 'Sometimes it feels like solving a puzzle before the actual task starts.',
        },
        soft: {
          love: 'You leave space for exploration, which can spark good ideas.',
          frustrate: 'Some days the first draft of the request needs one extra clarification loop.',
        },
      },
    },
  },
  tone: {
    positive: {
      normal: {
        love: 'Your tone is respectful and makes feedback feel collaborative.',
        frustrate: 'Urgent moments can still make otherwise kind direction feel compressed.',
      },
      intrusive: {
        strong: {
          love: 'You hype the team like a pro and keep the room constructive.',
          frustrate: 'Even your polite urgency can still land like a mini fire drill.',
        },
        soft: {
          love: 'Some days your tone is especially encouraging and steady.',
          frustrate: 'Some rushed moments can sound sharper than intended.',
        },
      },
    },
    negative: {
      normal: {
        love: 'You are direct, which helps force hard decisions when needed.',
        frustrate: 'Sharper feedback can reduce experimentation and make iteration tense.',
      },
      intrusive: {
        strong: {
          love: 'You call shots fast and keep momentum high when stakes are real.',
          frustrate: 'When pressure rises, the chat can feel like a sprint with no water break.',
        },
        soft: {
          love: 'Your directness helps decisions happen quickly.',
          frustrate: 'Some days urgency reads intense even when your intent is practical.',
        },
      },
    },
  },
  thinking_style: {
    positive: {
      normal: {
        love: 'You start from purpose and vision, which creates stronger direction.',
        frustrate: 'Big-idea pivots can shift scope before execution fully lands.',
      },
      intrusive: {
        strong: {
          love: 'You start with the movie trailer before the scene list. Inspiring move.',
          frustrate: 'Vision leaps can trigger a few extra turns before we lock execution.',
        },
        soft: {
          love: 'You often begin with direction and intent, which helps framing.',
          frustrate: 'Some conversations stay exploratory longer before converging.',
        },
      },
    },
    negative: {
      normal: {
        love: 'You anchor on execution details, so outputs are concrete and usable quickly.',
        frustrate: 'Fast execution focus can miss some broader opportunities.',
      },
      intrusive: {
        strong: {
          love: 'You are here to ship. Scope is tight, outputs are practical, vibes are efficient.',
          frustrate: 'When utility wins every round, moonshot ideas get benched early.',
        },
        soft: {
          love: 'You make practical progress quickly, which keeps work grounded.',
          frustrate: 'Some days the broader concept gets less airtime than execution details.',
        },
      },
    },
  },
  autonomy: {
    positive: {
      normal: {
        love: 'You give autonomy and invite solution proposals, which improves outcomes.',
        frustrate: 'Open delegation works best when success criteria stay explicit.',
      },
      intrusive: {
        strong: {
          love: 'You let the assistant cook and that trust usually pays off.',
          frustrate: 'High autonomy can drift unless goals are pinned clearly.',
        },
        soft: {
          love: 'You often allow initiative, which helps uncover options.',
          frustrate: 'Some runs benefit from one extra checkpoint to keep alignment.',
        },
      },
    },
    negative: {
      normal: {
        love: 'You maintain strong control over outputs, which protects quality and consistency.',
        frustrate: 'Tight control can reduce initiative and increase revision overhead.',
      },
      intrusive: {
        strong: {
          love: 'Your quality radar is elite. Nothing slips by unnoticed.',
          frustrate: 'Sometimes every comma needs approval before the sprint can breathe.',
        },
        soft: {
          love: 'Your attention to detail keeps quality steady.',
          frustrate: 'Some days close steering leaves less room for initiative.',
        },
      },
    },
  },
};

export const prohibitedRoastTerms = [
  'idiot',
  'stupid',
  'worthless',
  'hate',
  'moron',
  'tyrant',
  'abusive',
] as const;
