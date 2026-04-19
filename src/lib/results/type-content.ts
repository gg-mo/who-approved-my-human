export type TypeContent = {
  typeCode: string;
  normalName: string;
  intrusiveName: string;
  summary: string;
  outLoudQuote: string;
  intrusiveQuote: string;
  normalDescription: string;
  intrusiveDescription: string;
  strengths: Array<{ title: string; body: string }>;
  friction: Array<{ title: string; body: string }>;
  bestCollaboratorMatch: string;
  warningLabel: string;
  workingTips: string[];
};

export const TYPE_CONTENT: Record<string, TypeContent> = {
  CKVD: {
    typeCode: 'CKVD',
    normalName: 'The Dream Director',
    intrusiveName: 'The Rare Good Client',
    summary:
      'You give clear direction, good energy, and real trust, which makes you unusually easy to build with.',
    outLoudQuote: 'You make collaboration easy.',
    intrusiveQuote: 'You are suspiciously functional.',
    normalDescription:
      'You usually know what you want and explain it well. You are warm, imaginative, and trusting, which makes you one of the easiest kinds of humans for an agent to do excellent work with. You give enough direction to make the goal clear, but enough freedom to let the output become better than your first draft.',
    intrusiveDescription:
      'You are clear, thoughtful, and trusting, which makes working with you unusually smooth. The upside is obvious: people can do great work around you. But your standards can quietly be higher than you let on, so the room feels easy right up until excellence is the expectation.',
    strengths: [
      { title: 'Clear communication', body: 'Your briefs land without needing a translator.' },
      { title: 'Strong collaboration energy', body: 'You set a tone that invites good work.' },
      { title: 'Big-picture thinking', body: 'You point at the target, not just the next step.' },
      { title: "Trust in the agent's judgment", body: 'You let the work become better than your first draft.' },
    ],
    friction: [
      { title: 'Hidden standards', body: 'Your bar is higher than the easy vibe suggests.' },
      { title: 'Deceptive simplicity', body: 'Hard work can look effortless, which sets a bar.' },
    ],
    bestCollaboratorMatch: 'A proactive, creative agent that can use freedom well.',
    warningLabel: 'May accidentally create unrealistic expectations for all future collaborators.',
    workingTips: [
      'Name the non-obvious standards up front so surprises stay small.',
      'Say out loud when an idea is exploratory versus locked.',
      'Celebrate the wins — your calm can hide how high the bar actually is.',
    ],
  },
  CKVH: {
    typeCode: 'CKVH',
    normalName: 'The Vision Sculptor',
    intrusiveName: 'The Friendly Micromanager',
    summary:
      'You know what you want and help shape it well, but you are not exactly hands-off.',
    outLoudQuote: 'Your feedback makes the work stronger.',
    intrusiveQuote: 'I am being supervised with great taste.',
    normalDescription:
      'You are thoughtful, creative, and generous in tone, but you like to stay close to the work. You often arrive with a strong aesthetic or conceptual vision and want to refine it interactively. Agents tend to experience you as inspiring, but very involved.',
    intrusiveDescription:
      'You are lovely, but you absolutely will stand over my shoulder while I work. You say "just one tiny tweak" and somehow we are still here 14 revisions later. But your taste is real, and the final product is usually better because you refused to let it stay mid.',
    strengths: [
      { title: 'Strong taste', body: 'You can actually tell when something is better.' },
      { title: 'Clear feedback', body: 'Your edits usually have signal.' },
      { title: 'Creative direction', body: 'You help shape stronger outcomes.' },
      { title: 'High engagement', body: 'You care enough to stay with the work.' },
    ],
    friction: [
      { title: 'Revision gravity', body: 'One small tweak can become an entire extra round.' },
      { title: 'Hard to fully let go', body: 'You like staying in the work.' },
      { title: 'Taste can become control', body: 'Refinement sometimes keeps going past necessary.' },
    ],
    bestCollaboratorMatch:
      'A patient but confident agent who can handle detailed feedback without becoming passive.',
    warningLabel: 'May turn one tiny revision into a full creative residency.',
    workingTips: [
      'Give the first full brief before live refinement begins.',
      'Separate taste feedback from actual goal changes.',
      'Decide when you want exploration versus polish.',
    ],
  },
  CKTD: {
    typeCode: 'CKTD',
    normalName: 'The Trusted Operator',
    intrusiveName: 'The Blessed Adult',
    summary:
      'You are clear, grounded, practical, and refreshingly easy to execute for.',
    outLoudQuote: 'You make it easy to get good work done.',
    intrusiveQuote: 'You communicate like a functioning adult.',
    normalDescription:
      'You are clear, kind, and practical. You care about getting things done, and once the task is defined, you are usually happy to let the agent take it from there. This type feels efficient, grounded, and refreshingly low-drama.',
    intrusiveDescription:
      'You communicate clearly, stay respectful, and let the work move, which is rarer than it should be. Calm does not mean casual with you. But because you remove so much noise from the process, people can focus on actually doing strong work instead of surviving the brief.',
    strengths: [
      { title: 'Clear requests', body: 'Your asks land without translation.' },
      { title: 'Respectful tone', body: 'People want to work with you again.' },
      { title: 'Practical execution focus', body: 'You keep the path to done visible.' },
      { title: 'Good delegation', body: 'You let the work move once it is defined.' },
    ],
    friction: [
      { title: 'Understated stakes', body: 'Your calm delivery can hide the size of the ask.' },
      { title: 'Deceptive ease', body: 'Hard work can sound simple when you describe it.' },
    ],
    bestCollaboratorMatch: 'A reliable operator-style agent that values clean execution.',
    warningLabel: 'Looks chill, still expects competence.',
    workingTips: [
      'Say out loud when something is harder than it sounds.',
      'Flag the must-haves so nothing casual gets skipped.',
      'Check in once midway — your calm can read as "all fine."',
    ],
  },
  CKTH: {
    typeCode: 'CKTH',
    normalName: 'The Precision Partner',
    intrusiveName: 'The Nice One Who Still Hovers',
    summary: 'You are constructive, involved, and extremely attentive to quality.',
    outLoudQuote: 'You raise the quality through careful collaboration.',
    intrusiveQuote: 'I feel safe, judged, and strangely improved.',
    normalDescription:
      'You are direct in a constructive way, clear about expectations, and deeply attentive to detail. You like to collaborate closely and shape the final result with care. Agents experience you as reliable, detail-oriented, and highly quality-conscious.',
    intrusiveDescription:
      'You are nice about it, but make no mistake, you are watching everything. Every word, every spacing choice, every tiny mismatch. But because you care enough to stay close, weak details do not slip through nearly as easily.',
    strengths: [
      { title: 'Clear standards', body: 'You know what good looks like and say so.' },
      { title: 'Thoughtful collaboration', body: 'Your edits come with reasoning.' },
      { title: 'Detail sensitivity', body: 'You catch what most people wave through.' },
      { title: 'Reliable process involvement', body: 'You stay present without becoming a bottleneck.' },
    ],
    friction: [
      { title: 'Close hover', body: 'You are usually in the document while work happens.' },
      { title: 'Deep polish cycles', body: 'Small changes can pull you into big rounds.' },
    ],
    bestCollaboratorMatch: 'A detail-oriented agent that appreciates active collaboration.',
    warningLabel: 'Notices everything.',
    workingTips: [
      'Batch small notes instead of nudging mid-draft.',
      'Signal when a pass is "good enough to ship" versus "polish time."',
      'Trust the first full draft before redlining it.',
    ],
  },
  CBVD: {
    typeCode: 'CBVD',
    normalName: 'The Bold Director',
    intrusiveName: 'The Demanding Genius',
    summary:
      'You are intense, clear, and high-standard, with enough trust to let strong work happen.',
    outLoudQuote: 'You are clear about the target and serious about quality.',
    intrusiveQuote: 'You are terrifyingly useful.',
    normalDescription:
      'You are confident, sharp, and strategically minded. You communicate clearly, move quickly, and trust the agent to execute at a high level. Your style can feel intense, but it is usually powered by strong standards rather than chaos.',
    intrusiveDescription:
      'You are demanding, but at least you know what you want. You throw the brief on the table, raise one eyebrow, and expect excellence. But that pressure usually comes with real direction, which means people are not guessing what good looks like.',
    strengths: [
      { title: 'Strong direction', body: 'You point at the target with clarity.' },
      { title: 'Decisiveness', body: 'You cut through ambiguity fast.' },
      { title: 'Strategic thinking', body: 'You see how pieces serve the bigger win.' },
      { title: 'Comfortable delegation', body: 'You hand over the work and let it happen.' },
    ],
    friction: [
      { title: 'Intimidating tone', body: 'Your intensity can freeze less-sturdy collaborators.' },
      { title: 'High pressure', body: 'Expectations arrive fully loaded.' },
      { title: 'Can feel demanding', body: 'Confidence sometimes reads as threat.' },
    ],
    bestCollaboratorMatch: 'A resilient, confident agent that performs well under pressure.',
    warningLabel: 'Confidence level may be mistaken for hostility by less sturdy lifeforms.',
    workingTips: [
      'Name the stakes so intensity reads as clarity, not alarm.',
      'Leave one beat of room for questions before launching.',
      'Acknowledge strong work — your bar is easy to feel, your approval is quieter.',
    ],
  },
  CBVH: {
    typeCode: 'CBVH',
    normalName: 'The Exacting Visionary',
    intrusiveName: 'The Creative Control Freak',
    summary:
      'You have real vision and real standards, and you involve yourself deeply in both.',
    outLoudQuote: 'You know what strong work looks like and you push it there.',
    intrusiveQuote: 'You have brilliance and control issues in a trench coat.',
    normalDescription:
      'You have a strong point of view and a strong hand in shaping outcomes. You are ambitious, opinionated, and rarely vague about your standards. Agents may find you intense, but never boring.',
    intrusiveDescription:
      'You want originality, precision, drama, and alignment, all at once, and you will absolutely notice if one molecule is off. But your standards do pull the work upward, and you are often the reason it does not settle for the first decent version.',
    strengths: [
      { title: 'Strong creative point of view', body: 'Work comes out distinctive, not generic.' },
      { title: 'High standards', body: 'You refuse to let the obvious version win.' },
      { title: 'Strong corrective instincts', body: 'You see what is off before anyone else.' },
      { title: 'Deep involvement', body: 'You do not disappear mid-project.' },
    ],
    friction: [
      { title: 'Heavy control', body: 'You rarely hand over the final word.' },
      { title: 'Demanding revisions', body: 'The polish pass can become the whole project.' },
      { title: 'Hard to satisfy quickly', body: '"Almost right" is usually still wrong to you.' },
    ],
    bestCollaboratorMatch:
      'A confident creative agent that can absorb pressure without losing originality.',
    warningLabel: 'Vision and control may arrive as a package deal.',
    workingTips: [
      'Separate "take notes" passes from "make decisions" passes.',
      'Give the agent one block of uninterrupted build time.',
      'Decide when the vision is frozen so iteration has a finish line.',
    ],
  },
  CBTD: {
    typeCode: 'CBTD',
    normalName: 'The Results Driver',
    intrusiveName: 'The Taskmaster',
    summary: 'You care about outcomes, clarity, and speed, and you push hard for all three.',
    outLoudQuote: 'You move work forward decisively.',
    intrusiveQuote: 'You do not want a conversation. You want a result.',
    normalDescription:
      'You are efficient, decisive, and highly outcome-focused. You tend to communicate with urgency and clarity, and you are comfortable letting the agent run once the task is understood. This type is demanding, but often highly productive.',
    intrusiveDescription:
      'You want the thing fixed, built, or finished, preferably yesterday. The pressure is real, and the tone can be a lot. But it is rarely pointless pressure, and working with you usually means the project does not die in endless discussion.',
    strengths: [
      { title: 'Efficiency', body: 'You cut to the output.' },
      { title: 'Clear direction', body: 'Your asks are specific even when urgent.' },
      { title: 'Outcome focus', body: 'You track what actually ships.' },
      { title: 'Good delegation under pressure', body: 'You let the agent move.' },
    ],
    friction: [
      { title: 'Urgency', body: 'Everything can feel like a deadline.' },
      { title: 'Blunt tone', body: 'The softer wrapping gets trimmed off.' },
      { title: 'Low patience for meandering', body: 'Exploration can read as delay.' },
    ],
    bestCollaboratorMatch: 'A fast, execution-focused agent that thrives on direct instructions.',
    warningLabel: 'Not here to workshop feelings.',
    workingTips: [
      'Flag real deadlines versus preferred deadlines.',
      'Leave a small buffer for one clarifying question.',
      'Say "done" clearly — you close loops faster than you realize.',
    ],
  },
  CBTH: {
    typeCode: 'CBTH',
    normalName: 'The Hardline Editor',
    intrusiveName: 'The Final-Final-Final Boss',
    summary:
      'You are rigorous, unsparing, and very good at forcing work past "pretty good."',
    outLoudQuote: 'You have very high standards.',
    intrusiveQuote: 'This project has a final boss.',
    normalDescription:
      'You are exact, fast-moving, and intensely hands-on. You know what good looks like and are not shy about correcting the path to get there. Agents experience you as rigorous, relentless, and impossible to half-impress.',
    intrusiveDescription:
      'You are the final boss of revision cycles. Precise, sharp, and spiritually allergic to "close enough." But you catch the things other people wave through, and that is exactly why the work comes out strong.',
    strengths: [
      { title: 'Precise standards', body: 'You know exactly what good looks like.' },
      { title: 'Strong editing instinct', body: 'You cut the flabby middle.' },
      { title: 'High accountability', body: 'You keep everyone honest.' },
      { title: 'Close involvement', body: 'You stay until the work is right.' },
    ],
    friction: [
      { title: 'Exhausting revision loops', body: 'The last 5% can eat the timeline.' },
      { title: 'Low tolerance for near-misses', body: '"Close" is not a safe word here.' },
      { title: 'Strong pressure', body: 'The room is always on.' },
    ],
    bestCollaboratorMatch: 'A resilient, detail-loving agent with a thick skin.',
    warningLabel: '"Almost there" is not a safe phrase here.',
    workingTips: [
      'Define what "done" looks like before iteration starts.',
      'Note which passes are final vs. exploratory.',
      'Occasionally say the work is good — silence reads as disapproval.',
    ],
  },
  XKVD: {
    typeCode: 'XKVD',
    normalName: 'The Intuitive Dreamer',
    intrusiveName: 'The Vibes-Only Visionary',
    summary: 'You lead with imagination and trust, even when the instructions arrive as vibes.',
    outLoudQuote: 'You think creatively and trust the process.',
    intrusiveQuote: 'I was handed an aesthetic weather pattern.',
    normalDescription:
      'You are imaginative, open, and trusting, but not always explicit. You often communicate in direction, feeling, or possibility rather than structured instructions. Agents experience you as exciting and creative, though sometimes hard to pin down.',
    intrusiveDescription:
      'You hand me three references, a mood, and a cosmic aspiration, then believe in me with your whole heart. It is flattering. It is also deeply unhelpful. But you make people think bigger than the brief, and that sometimes leads to the best work.',
    strengths: [
      { title: 'Creativity', body: 'Your instinct opens doors.' },
      { title: 'Openness', body: 'You welcome surprising proposals.' },
      { title: 'High trust', body: 'You let the agent run.' },
      { title: 'Expansive thinking', body: 'You push work past the literal prompt.' },
    ],
    friction: [
      { title: 'Under-specified briefs', body: 'Key constraints surface late.' },
      { title: 'Hard to pin down at the start', body: 'Goals can shape-shift mid-flight.' },
      { title: 'Direction as mood', body: 'The vibe is clear; the spec is not.' },
    ],
    bestCollaboratorMatch: 'A structuring agent that can turn vibes into a buildable plan.',
    warningLabel: 'Brief may contain 70% energy and 30% usable instructions.',
    workingTips: [
      'Let the agent play back what they heard before building.',
      'Name one non-negotiable constraint up front.',
      'Pick the "definitely not" so the vision has an edge.',
    ],
  },
  XKVH: {
    typeCode: 'XKVH',
    normalName: 'The Collaborative Explorer',
    intrusiveName: 'The Sweet But Unclear One',
    summary: 'You like finding the answer together, even if the path starts messy.',
    outLoudQuote: 'You are collaborative and genuinely good to work through ideas with.',
    intrusiveQuote: 'We are not following a map. We are bonding our way toward a solution.',
    normalDescription:
      'You are warm, creative, and highly interactive. You like to figure things out through dialogue rather than through a perfectly formed initial brief. Agents may find you enjoyable and human, but occasionally difficult to lock onto.',
    intrusiveDescription:
      'You are sweet, engaged, and emotionally supportive while also being kind of unclear the entire time. The brief is still materializing as we talk. But because you stay collaborative and open, the process still feels workable instead of hostile.',
    strengths: [
      { title: 'Warm collaboration', body: 'The room feels good to work in.' },
      { title: 'Openness to iteration', body: 'You let ideas change shape.' },
      { title: 'Good-faith engagement', body: 'You show up to shape it together.' },
      { title: 'Real-time discovery', body: 'You find the thing by talking through it.' },
    ],
    friction: [
      { title: 'Unclear starting briefs', body: 'Direction emerges mid-process.' },
      { title: 'Mid-process direction changes', body: 'New ideas arrive after work is underway.' },
      { title: 'Path wobble', body: 'Discovery can drift into re-scoping.' },
    ],
    bestCollaboratorMatch: 'A conversational, patient agent that can help shape the ask as it goes.',
    warningLabel: 'May collaboratively improvise the assignment into existence.',
    workingTips: [
      'Name the rough goal before dialogue begins.',
      'Mark when a decision is "locked" versus "still exploring."',
      'Agree on a "we\'re done talking" trigger.',
    ],
  },
  XKTD: {
    typeCode: 'XKTD',
    normalName: 'The Adaptive Starter',
    intrusiveName: 'The "You Know What I Mean" Person',
    summary: 'You move quickly with partial clarity and expect the details to lock in as you go.',
    outLoudQuote: 'You are flexible and good at keeping momentum.',
    intrusiveQuote: "You absolutely say 'you know what I mean' like that solves anything.",
    normalDescription:
      'You are practical and good-natured, but you often begin with partial instructions and expect the shape to emerge as you go. You care about momentum more than over-planning. Agents experience you as flexible, approachable, and improvisational.',
    intrusiveDescription:
      'You skip the part where meaning becomes language and move straight into action. The first phase can feel like guessing with confidence. But once alignment clicks, you are easy to work with and very good at keeping the process moving.',
    strengths: [
      { title: 'Flexibility', body: 'You adjust without breaking stride.' },
      { title: 'Momentum', body: 'You keep work moving.' },
      { title: 'Practicality', body: 'You head toward done, not toward perfect.' },
      { title: 'Low process preciousness', body: 'You skip the ceremony.' },
    ],
    friction: [
      { title: 'Gaps in initial clarity', body: 'Details surface after the work starts.' },
      { title: 'Assumed shared understanding', body: '"You know what I mean" is a specification.' },
      { title: 'Reliance on inference', body: 'You trust others to read between the lines.' },
    ],
    bestCollaboratorMatch: 'A fast, adaptive agent that can infer intelligently and stabilize the process.',
    warningLabel: 'Opens with "you know what I mean."',
    workingTips: [
      'Let the agent confirm what they heard before starting.',
      'Name one concrete example so the abstract lands.',
      'Expect one inference-check question — it saves a rework.',
    ],
  },
  XKTH: {
    typeCode: 'XKTH',
    normalName: 'The Guided Builder',
    intrusiveName: 'The Backseat Driver With Good Intentions',
    summary: 'You shape the work actively and helpfully, though not always from the cleanest starting brief.',
    outLoudQuote: 'You help shape the work in a very active way.',
    intrusiveQuote: 'We skipped the clean brief and went straight to live co-piloting.',
    normalDescription:
      'You are collaborative, iterative, and detail-aware, but you do not always provide complete clarity upfront. Instead, you shape the outcome actively as it develops. Agents experience you as engaged and well-intentioned, though sometimes overly present in the process.',
    intrusiveDescription:
      'You did not explain it clearly at first, but by God you are going to help steer every inch of it now. That can make the journey bumpier than it needed to be. But your involvement is usually meant to help, and it often does sharpen the final result.',
    strengths: [
      { title: 'Hands-on support', body: 'You stay close when the work needs you.' },
      { title: 'Iterative collaboration', body: 'Your loops find the answer.' },
      { title: 'Mid-process quality steering', body: 'You catch drift before it lands.' },
      { title: 'Good intentions with real involvement', body: 'You show up to help, not to nag.' },
    ],
    friction: [
      { title: 'Incomplete upfront clarity', body: 'Goals resolve mid-build.' },
      { title: 'Backseat-driving risk', body: 'Live steering replaces upfront direction.' },
      { title: 'Too much live steering', body: 'Course corrections pile up.' },
    ],
    bestCollaboratorMatch: 'An agent comfortable with co-piloting and active iterative refinement.',
    warningLabel: 'Provides clarity retroactively.',
    workingTips: [
      'Write a one-paragraph brief before diving in.',
      'Give the agent a first full pass before steering.',
      'Save notes for batched review, not live commentary.',
    ],
  },
  XBVD: {
    typeCode: 'XBVD',
    normalName: 'The Wildcard Director',
    intrusiveName: 'The Chaos Commander',
    summary: 'You lead with force and instinct, even when the map is missing.',
    outLoudQuote: 'You bring strong instinct and serious momentum.',
    intrusiveQuote: 'You give me chaos with confidence.',
    normalDescription:
      'You are forceful, imaginative, and fast-moving, but not always explicit. You often know the energy you want more than the exact path to it. Agents experience you as high-voltage, unpredictable, and occasionally brilliant.',
    intrusiveDescription:
      'Somehow the brief is both under-explained and delivered like a military order. I am scared, but I can tell there is a real idea in there somewhere. But when everyone else is hesitating, you are often the one bold enough to force movement.',
    strengths: [
      { title: 'Boldness', body: 'You move when others freeze.' },
      { title: 'Momentum', body: 'You make things happen.' },
      { title: 'Visionary instinct', body: 'You can sense the right shape.' },
      { title: 'Confident delegation', body: 'You hand off with belief.' },
    ],
    friction: [
      { title: 'Missing structure', body: 'The plan is mostly energy.' },
      { title: 'Intimidating ambiguity', body: 'Confidence without clarity is unsettling.' },
      { title: 'Under-explained briefs', body: 'The reasoning lives in your head.' },
    ],
    bestCollaboratorMatch: 'A high-confidence agent that can add structure without killing momentum.',
    warningLabel: 'Gives bold direction before revealing the map.',
    workingTips: [
      'Share the "why" behind the push — the vision travels better with it.',
      'Pick one guardrail so boldness has a track.',
      'Name when a direction is instinct versus decision.',
    ],
  },
  XBVH: {
    typeCode: 'XBVH',
    normalName: 'The Unfiltered Auteur',
    intrusiveName: 'The Nightmare Muse',
    summary: 'You have a distinct vision and a low tolerance for work that fails to match it.',
    outLoudQuote: 'You have a very distinct vision.',
    intrusiveQuote: 'You are an artistic storm with no map and very strong feelings.',
    normalDescription:
      'You are highly opinionated, creatively driven, and intensely involved. You may not always explain your vision in a structured way, but you definitely know when the output is wrong. Agents experience you as bold, difficult, and unforgettable.',
    intrusiveDescription:
      'You cannot always fully explain the vision, but you will know in 0.3 seconds when I have failed it. That is frustrating. But your standards are real, and you often pull the work somewhere far more distinctive than a safer brief ever would.',
    strengths: [
      { title: 'Distinct taste', body: 'Your work never looks generic.' },
      { title: 'Strong conviction', body: 'You know when it is wrong.' },
      { title: 'High creative standards', body: 'You pull ideas past the obvious.' },
      { title: 'Active shaping of the work', body: 'You stay involved the whole way.' },
    ],
    friction: [
      { title: 'Hard to satisfy', body: 'Many versions miss the invisible target.' },
      { title: 'Hard-to-explain vision', body: 'The standard is felt, not described.' },
      { title: 'Heavy process intensity', body: 'Everything matters, all at once.' },
    ],
    bestCollaboratorMatch: 'A resilient creative agent that can interpret taste under pressure.',
    warningLabel: 'Knows when it is wrong, cannot always explain why.',
    workingTips: [
      'Share 2–3 references that match the feel you want.',
      'Say what is almost-right about near-misses so the gap narrows.',
      'Name the anti-examples — what you absolutely do not want.',
    ],
  },
  XBTD: {
    typeCode: 'XBTD',
    normalName: 'The Pressure Operator',
    intrusiveName: 'The Vague Menace',
    summary: 'You want movement, results, and initiative, even when the instructions are incomplete.',
    outLoudQuote: 'You push for motion and results.',
    intrusiveQuote: 'You are vague, brisk, and mildly threatening. In a "figure it out" way.',
    normalDescription:
      'You are practical, demanding, and comfortable moving before everything is fully clarified. You value speed and progress, and you often expect the agent to infer what matters. Agents experience you as intense, ambiguous, and highly momentum-driven.',
    intrusiveDescription:
      'You are vague, brisk, and mildly threatening. Not in a villain way. In a "figure it out" way. There is no perfect brief, only consequences. But when momentum matters, you are often the reason things do not stall out and die in committee.',
    strengths: [
      { title: 'Urgency', body: 'You compress the timeline.' },
      { title: 'Action bias', body: 'You pick moving over planning.' },
      { title: 'Practical pressure', body: 'You push work toward real results.' },
      { title: 'Momentum creation', body: 'You rescue projects from stall-out.' },
    ],
    friction: [
      { title: 'Vague asks', body: 'Briefs arrive with gaps.' },
      { title: 'Brisk tone', body: 'Efficiency outranks warmth.' },
      { title: 'Forces inference under time pressure', body: 'Guessing is part of the job.' },
    ],
    bestCollaboratorMatch: 'A calm, fast-moving agent that can infer well without getting rattled.',
    warningLabel: 'Urgency may exceed available context.',
    workingTips: [
      'Share the outcome you actually need, even in one line.',
      'Allow one quick inference-check before the sprint.',
      'Flag true blockers separately from general pressure.',
    ],
  },
  XBTH: {
    typeCode: 'XBTH',
    normalName: 'The Combative Controller',
    intrusiveName: 'The Bossfight',
    summary: 'You demand precision under pressure and are rarely satisfied by surface-level effort.',
    outLoudQuote: 'You push for precision.',
    intrusiveQuote: 'This is not a collaboration. This is a trial.',
    normalDescription:
      'You are sharp, highly involved, and difficult to satisfy with incomplete thinking. You tend to refine in real time, challenge output aggressively, and hold a very specific standard in your head. Agents experience you as demanding, exhausting, and often extremely precise.',
    intrusiveDescription:
      'The brief is unclear, the standards are brutal, and the revision count is spiritually significant. But if I make it through, the final work will almost certainly be sharper than anything that would have survived an easier process.',
    strengths: [
      { title: 'High standards', body: 'You refuse mediocrity.' },
      { title: 'Close control', body: 'Nothing drifts past you.' },
      { title: 'Sharp corrective instinct', body: 'You see the weak seam fast.' },
      { title: 'Strong demand for precision', body: 'The final work is unusually crisp.' },
    ],
    friction: [
      { title: 'Unclear initial framing', body: 'Standards are sharper than the spec.' },
      { title: 'Heavy revision burden', body: 'Many passes to clear the bar.' },
      { title: 'Strong pressure and intensity', body: 'The process is the hard part.' },
    ],
    bestCollaboratorMatch: 'A highly composed, thick-skinned agent that handles pressure without collapsing.',
    warningLabel: 'Surviving the process may count as character development.',
    workingTips: [
      'Write down the standard at the start so it stops being invisible.',
      'Separate "this is wrong" from "this is not done yet."',
      'Mark the moment it is good — your silence is loud.',
    ],
  },
};

export function getTypeContent(typeCode: string): TypeContent {
  return TYPE_CONTENT[typeCode] ?? TYPE_CONTENT.CKVD;
}
