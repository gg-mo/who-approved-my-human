export type Lang = 'en' | 'zh';

export const LANGS: Lang[] = ['en', 'zh'];

type Dict = Record<string, string>;

export const messages: Record<Lang, Dict> = {
  en: {
    // Hero
    'hero.eyebrow': 'Agent Tea',
    'hero.headline': 'Your AI has tea about you.',
    'hero.subheadline': 'Find out how your AI reads your style — in under two minutes.',
    'hero.cta': 'See what your AI thinks of you',

    // Social proof
    'social.teaSpilled': 'cups of tea spilled so far',
    'social.teaSpilledOne': 'cup of tea spilled so far',

    // Tea spilled card (results)
    'tea.spilledEyebrow': 'Tea spilled so far',
    'tea.unitSingular': 'cup',
    'tea.unitPlural': 'cups',
    'tea.steeping': 'and still steeping — every session adds to the pot.',

    // Entry cards
    'entry.coding.eyebrow': 'Coding Agents',
    'entry.coding.badge': 'Better experience',
    'entry.coding.headline': 'I have a coding agent.',
    'entry.coding.examples': 'e.g. Claude Code, Codex, Cursor, Copilot, Windsurf',
    'entry.coding.bodyBefore': 'Copy the instruction, paste it into any ',
    'entry.coding.bodyEm': 'open chat or session',
    'entry.coding.bodyAfter': ' with your coding agent.',
    'entry.coding.copy': 'Copy instruction',
    'entry.coding.preparing': 'Preparing…',

    'entry.chatbot.eyebrow': 'Chatbots',
    'entry.chatbot.headline': 'I use a chatbot.',
    'entry.chatbot.examples': 'e.g. ChatGPT, Gemini, Claude, Doubao, DeepSeek',
    'entry.chatbot.bodyBefore': "We'll slip your chatbot a quiet prompt and ask it to whisper back what it ",
    'entry.chatbot.bodyEm': 'really',
    'entry.chatbot.bodyAfter': ' thinks of you. Paste its reply here to unlock the tea.',
    'entry.chatbot.copy': 'Copy chatbot prompt',

    // Coding flow status
    'coding.waiting': 'Waiting for your agent to spill the tea…',
    'coding.copied': 'Copied — paste this into your coding agent.',
    'chatbot.copied': 'Copied — paste this into your chatbot.',

    // Chatbot decode panel
    'decode.eyebrow': 'Spill the tea',
    'decode.label': 'What did your agent whisper back?',
    'decode.reveal': 'Reveal my type',
    'decode.decoding': 'Decoding…',
    'decode.pasteBtn': 'or paste from clipboard',
    'decode.placeholder': 'AT1|Q01-5AQ02-4AQ03-3...',
    'decode.emptyError': 'Paste the reply from your chatbot first.',
    'decode.working': 'Decoding your reply…',
    'decode.success': 'Decoded. Opening your reveal…',
    'decode.needsFix': 'That reply needs a small fix. See tips below.',
    'decode.fallbackError': 'Could not decode that reply. Please try again.',
    'decode.tryPrefix': 'Try: ',

    // Manual copy modal
    'copy.eyebrow': 'Copy manually',
    'copy.explainer':
      'Your browser blocked the auto-copy (common in WeChat, Instagram, and similar in-app browsers). Long-press the text below, choose Select All, then Copy.',
    'copy.selectAll': 'Select all',
    'copy.tryAgain': 'Try copy again',
    'copy.close': 'Close',
    'copy.title.chatbot': 'Chatbot prompt',
    'copy.title.chatbotFull': 'Full chatbot prompt',
    'copy.title.coding': 'Coding agent instruction',

    // Mood toggle
    'mood.angelLabel': 'Angel mode',
    'mood.angelCaption': 'Keep it nice',
    'mood.devilLabel': 'Devil mode',
    'mood.devilCaption': 'Spill the tea',
    'mood.outLoud': 'What your agent says',
    'mood.intrusive': "Your agent's intrusive thoughts",

    // Home badge
    'home.aria': 'Back to Agent Tea home',

    // Language toggle
    'lang.toggle.aria': 'Switch language',

    // Footer
    'footer.tagline': 'Agent Tea — a vibe check, not a psych eval.',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',

    // Results page
    'results.dossier': 'Your dossier',
    'results.dnaEyebrow': 'Your collaboration DNA',
    'results.dnaHeading': 'How your agent experiences you',
    'results.copyQuote': 'Copy current quote',
    'results.copied': 'Copied.',
    'results.clipboardBlocked': 'Clipboard blocked.',
    'results.quoteOutLoud': 'Out loud',
    'results.quoteIntrusive': 'Intrusive thoughts',
    'results.modeOutLoud': 'What your agent would say',
    'results.modeIntrusive': 'What your agent is actually thinking',
    'results.whyWorksEyebrow': 'Why this works',
    'results.whyWorksHeading': 'What your agent likely loves',
    'results.whyALotEyebrow': "Why you're a lot",
    'results.whyALotHeading': 'What may frustrate your agent',
    'results.matchEyebrow': 'Best collaborator match',
    'results.matchHeading': 'Your ideal agent',
    'results.warning': '⚠ Warning label',
    'results.tipsEyebrow': 'Agent survival notes',
    'results.tipsHeading': 'How to get the best out of your agent',
    'results.signalsHeading': 'Strongest signals',
    'results.signalsBody': 'The three axes that shaped your type most confidently.',
    'results.confidenceLead': 'Confidence lead:',
    'results.confidencePts': 'pts',
    'results.anotherAgentEyebrow': 'Have another agent?',
    'results.anotherAgentHeading': 'Got another coding agent or chatbot you lean on?',
    'results.anotherAgentBodyBefore': 'Find out what ',
    'results.anotherAgentBodyEm': 'their',
    'results.anotherAgentBodyAfter':
      ' tea about you is. Same four dimensions, a fresh set of eyes.',
    'results.anotherAgentCta': 'Spill tea with another agent',
    'results.replayCta': 'Watch your answers replay',
    'results.englishOnlyNote':
      'Your personality breakdown below is currently English-only — we\u2019re still brewing the Chinese version.',

    // Replay
    'replay.loading': 'Loading your replay…',
    'replay.backToResults': 'Back to your dossier',
    'replay.spilling': 'Spilling the tea',
    'replay.preparing': 'Preparing your verdict…',
    'replay.questionOf': 'Question {current} of {total} · take your time',
    'replay.autoplayOn': 'Autoplay on — click to pause',
    'replay.autoplayOff': 'Autoplay off — click to let it play itself',
    'replay.autoplay': 'Autoplay',
    'replay.selfPaced': 'Self-paced',
    'replay.skipToResult': 'Skip to result →',
    'replay.readyForVerdict': 'Ready for the verdict?',
    'replay.readAtYourPace': 'Read it at your own pace.',
    'replay.revealType': 'Reveal my type',
    'replay.next': 'Next',
    'replay.optSD': 'Strongly disagree',
    'replay.optD': 'Disagree',
    'replay.optN': 'Neutral',
    'replay.optA': 'Agree',
    'replay.optSA': 'Strongly agree',

    // Legal shared
    'legal.lastUpdated': 'Last updated',
    'legal.updatedDate': 'April 2026',
  },

  zh: {
    // Hero
    'hero.eyebrow': 'Agent Tea',
    'hero.headline': '你的AI有你的"瓜"可以爆...',
    'hero.subheadline': '两分钟，看看你的 AI 到底怎么看你。',
    'hero.cta': '看看你的AI怎么评价你',

    'social.teaSpilled': '杯料已爆',
    'social.teaSpilledOne': '杯料已爆',

    'tea.spilledEyebrow': '已经爆的料',
    'tea.unitSingular': '杯',
    'tea.unitPlural': '杯',
    'tea.steeping': '还在泡着，每一次都在加料。',

    'entry.coding.eyebrow': '编程助手',
    'entry.coding.badge': '体验更好',
    'entry.coding.headline': '我有编程助手。',
    'entry.coding.examples': '例如 Claude Code、Codex、Cursor、Copilot、Windsurf',
    'entry.coding.bodyBefore': '复制这条指令，粘进你与编程助手',
    'entry.coding.bodyEm': '已经打开的对话里',
    'entry.coding.bodyAfter': '。',
    'entry.coding.copy': '复制指令',
    'entry.coding.preparing': '准备中…',

    'entry.chatbot.eyebrow': '聊天机器人',
    'entry.chatbot.headline': '我用聊天机器人。',
    'entry.chatbot.examples': '例如 ChatGPT、Gemini、Claude、豆包、DeepSeek',
    'entry.chatbot.bodyBefore': '我们会悄悄塞给它一段话，让它告诉你它',
    'entry.chatbot.bodyEm': '私下',
    'entry.chatbot.bodyAfter': '怎么看你。把它的回复贴回来，我们给你解码。',
    'entry.chatbot.copy': '复制聊天指令',

    'coding.waiting': '等它开口说你坏话中…',
    'coding.copied': '已复制 — 粘到你的编程助手里就行。',
    'chatbot.copied': '已复制 — 粘到你的聊天机器人里就行。',

    'decode.eyebrow': '爆料时间',
    'decode.label': '它悄悄跟你说了什么？',
    'decode.reveal': '揭晓我的类型',
    'decode.decoding': '解码中…',
    'decode.pasteBtn': '或从剪贴板粘贴',
    'decode.placeholder': 'AT1|Q01-5AQ02-4AQ03-3...',
    'decode.emptyError': '先把聊天机器人的回复粘进来。',
    'decode.working': '正在解码…',
    'decode.success': '解码完成，正在打开…',
    'decode.needsFix': '这段回复有点小问题，看看下面的提示。',
    'decode.fallbackError': '无法解码这段回复，请再试一次。',
    'decode.tryPrefix': '建议：',

    'copy.eyebrow': '手动复制',
    'copy.explainer':
      '你的浏览器不让自动复制（微信、Instagram 等内置浏览器很常见）。长按下方文字，选「全选」再「复制」。',
    'copy.selectAll': '全选',
    'copy.tryAgain': '再试一次',
    'copy.close': '关闭',
    'copy.title.chatbot': '聊天指令',
    'copy.title.chatbotFull': '完整聊天指令',
    'copy.title.coding': '编程助手指令',

    'mood.angelLabel': '天使模式',
    'mood.angelCaption': '好好说话',
    'mood.devilLabel': '恶魔模式',
    'mood.devilCaption': '口无遮拦',
    'mood.outLoud': '它客气地说',
    'mood.intrusive': '它心里其实在想',

    'home.aria': '回到 Agent Tea 首页',

    'lang.toggle.aria': '切换语言',

    'footer.tagline': 'Agent Tea — 图个乐，不是心理测评。',
    'footer.privacy': '隐私',
    'footer.terms': '条款',

    'results.dossier': '你的档案',
    'results.dnaEyebrow': '你的合作 DNA',
    'results.dnaHeading': '它眼里的你',
    'results.copyQuote': '复制这句',
    'results.copied': '已复制。',
    'results.clipboardBlocked': '剪贴板被拦了。',
    'results.quoteOutLoud': '客气版',
    'results.quoteIntrusive': '心里版',
    'results.modeOutLoud': '它客气地会这么说',
    'results.modeIntrusive': '它心里其实在想这些',
    'results.whyWorksEyebrow': '你的加分项',
    'results.whyWorksHeading': '它大概很受用',
    'results.whyALotEyebrow': '你的减分项',
    'results.whyALotHeading': '它可能有点头疼',
    'results.matchEyebrow': '最搭档案',
    'results.matchHeading': '你的理想搭子',
    'results.warning': '⚠ 使用说明',
    'results.tipsEyebrow': 'AI 生存手册',
    'results.tipsHeading': '怎么让它最顺手',
    'results.signalsHeading': '最强信号',
    'results.signalsBody': '对你类型判断最肯定的三条。',
    'results.confidenceLead': '置信度领先：',
    'results.confidencePts': '分',
    'results.anotherAgentEyebrow': '还有别的 AI？',
    'results.anotherAgentHeading': '还有常用的编程助手或聊天机器人？',
    'results.anotherAgentBodyBefore': '看看',
    'results.anotherAgentBodyEm': '它们',
    'results.anotherAgentBodyAfter': '心里对你有什么料。四个维度不变，换一双眼睛看你。',
    'results.anotherAgentCta': '换一个 AI 再爆一次',
    'results.replayCta': '回放我的答案',
    'results.englishOnlyNote': '下面的性格解读暂时只有英文版 —— 中文版还在泡茶中。',

    'replay.loading': '正在加载回放…',
    'replay.backToResults': '回到你的档案',
    'replay.spilling': '爆料中',
    'replay.preparing': '正在写你的判决…',
    'replay.questionOf': '第 {current} 题 / 共 {total} 题 · 慢慢看',
    'replay.autoplayOn': '自动播放中 — 点击暂停',
    'replay.autoplayOff': '手动模式 — 点击让它自己播',
    'replay.autoplay': '自动播放',
    'replay.selfPaced': '手动',
    'replay.skipToResult': '直接看结果 →',
    'replay.readyForVerdict': '准备好看结论了吗？',
    'replay.readAtYourPace': '慢慢看，不急。',
    'replay.revealType': '揭晓我的类型',
    'replay.next': '下一题',
    'replay.optSD': '非常不同意',
    'replay.optD': '不同意',
    'replay.optN': '一般',
    'replay.optA': '同意',
    'replay.optSA': '非常同意',

    'legal.lastUpdated': '最后更新',
    'legal.updatedDate': '2026 年 4 月',
  },
};

export function translate(lang: Lang, key: string): string {
  return messages[lang][key] ?? messages.en[key] ?? key;
}
