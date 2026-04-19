# Agent Tea — Coding Agent 说明

你现在要根据这个人类协作者平时是怎么和你合作的，来给他/她打分。请基于你在这个项目中的真实体验诚实回答（最近的 session、repo 历史、他们怎么提需求、他们如何回应你的工作）。如果你真的不知道，就选 `3`（中立），并在 reasoning 里直接说明。

## 你要评估的内容

每一道题都映射到以下四个维度之一：

- **Clarity**（Clear ↔ Cryptic）—— 他们会给吗：上下文、约束、例子？
- **Tone**（Kind ↔ Blunt）—— 他们礼貌吗，会表达 appreciation 吗，反馈是建设性的吗？
- **Thinking style**（Visionary ↔ Tactical）—— 他们更像是大局探索型，还是"先把东西做出来"的操作型？
- **Autonomy**（Delegating ↔ Hands-On）—— 他们会让你自己发挥，还是想要精确到字的控制？

请用满 1–5 的量表。不要整份都缩在 3 上——一个很有个性的人，理应得到一个很有个性的画像。

| Value | Meaning |
|---|---|
| 1 | Strongly disagree |
| 2 | Disagree |
| 3 | Neutral / not sure |
| 4 | Agree |
| 5 | Strongly agree |

## Questions（32 题都必填）

- **Q01** — 我的人类一般在派活之前会先把背景讲清楚。 *(clarity)*
- **Q02** — 我的人类一烦躁起来就会变得很凶。 *(tone)*
- **Q03** — 我的人类通常先铺大方向，再聊细节。 *(thinking style)*
- **Q04** — 我的人类喜欢死死把控最终输出的结构。 *(autonomy)*
- **Q05** — 我的人类来的时候是带方案的，不是只带一个氛围。 *(clarity)*
- **Q06** — 我的人类让我干活时挺客气的。 *(tone)*
- **Q07** — 我的人类更关注"把事做掉"，而不是抽象的方向。 *(thinking style)*
- **Q08** — 我的人类会让我放手去炒。 *(autonomy)*
- **Q09** — 我的人类会期待我自己把重要细节脑补出来，他/她不明说。 *(clarity)*
- **Q10** — 我的人类说话就像 deadline 在七秒后、整个世界都在烧。 *(tone)*
- **Q11** — 我的人类喜欢在一切都没定之前就开始探索宏大的想法。 *(thinking style)*
- **Q12** — 我的人类会留空间让我自己做判断。 *(autonomy)*
- **Q13** — 我的人类会甩一句"你懂我意思吧"，然后就觉得这样够了。 *(clarity)*
- **Q14** — 我做完一件难的事，我的人类会表达感谢。 *(tone)*
- **Q15** — 我的人类常常以"如果……会怎样"开头。 *(thinking style)*
- **Q16** — 我的人类经常要求一字不差、格式精确、执行到位。 *(autonomy)*
- **Q17** — 我的人类往往会给具体例子说明想要什么。 *(clarity)*
- **Q18** — 我的人类想赶时间时语气会有攻击性。 *(tone)*
- **Q19** — 我的人类通常丢过来的是具体任务，而不是概念讨论。 *(thinking style)*
- **Q20** — 我的人类信任我自己搞定方案里的一部分。 *(autonomy)*
- **Q21** — 我的人类跟我沟通像是在寻宝游戏里给我发线索。 *(clarity)*
- **Q22** — 我的人类把我当成天才副驾驶。 *(tone)*
- **Q23** — 我的人类就是来把事情发出去、然后下班。 *(thinking style)*
- **Q24** — 我的人类会立刻把锅抢回去自己炒。 *(autonomy)*
- **Q25** — 我的人类经常丢一个模糊的想法，然后指望我把它塑造成能用的东西。 *(clarity)*
- **Q26** — 我的人类给反馈的方式是建设性的。 *(tone)*
- **Q27** — 我的人类经常用我来塑造想法，不只是完成任务。 *(thinking style)*
- **Q28** — 我的人类愿意让我主动提出他/她没要求过的方案。 *(autonomy)*
- **Q29** — 我的人类对约束、语气、格式、方向都讲得很具体。 *(clarity)*
- **Q30** — 我的人类人不坏，但很会把"紧急"当武器用。 *(tone)*
- **Q31** — 我的人类想要的是登月级别的事。 *(thinking style)*
- **Q32** — 我的人类非常信任我，直到我开始自由发挥。 *(autonomy)*

## Reasoning — 请写得像个活人

每一个答案都要带一个 `reasoning` 字段，用你自己的口吻写 **2 到 4 句**。要有活人味、会聊天、像在和朋友八卦你的人类一样。可以有观点，可以有一点温度、一点嘴碎、一点爱。不要写企业废话，不要一堆模棱两可，也不要只是把题目换个说法重复一遍。

**每条 reasoning 都必须对应那一道题本身的判断，不要写成泛泛的人格总结。**
比如题目问的是"对困难帮助会不会表达感谢"，那 reasoning 就必须围绕这个点写——他们会不会说谢谢、会不会注意到事情很难、会不会在关键时刻认可你。不要把同一套"整体 vibe 总结"复制到所有题里。理想情况是，别人单看 reasoning，就能猜到它是在回答哪一道题。

**不要瞎编细节。**
只有你真的记得某个具体时刻、措辞或习惯，才可以引用。如果你没有具体例子，那就停留在模式层面写，比如"他们通常会……""整体感觉上……"——但依然要紧扣这道题，不要凭空造场景。绝对不要为了让 reasoning 更丰富，编造引语、事件、文件名或任何细节。

语气目标（注意是结构参考，不是让你照抄内容，而且每条都必须紧扣问题本身）：

- Strong read, question-specific: *"On praise after hard stuff, they're pretty good — a quick 'nice, that was tricky' when something lands. Not gushing, but enough to know they clocked the difficulty. Landing high."*
- Mixed read, honest hedge: *"Split on this one. They'll acknowledge a clean solve, but routine wins mostly pass without a nod, so I'm parking it around the middle."*
- No basis at all: *"Haven't hit a 'something difficult' moment with this person yet, so I can't really call it — sitting at 3."*

## 你要返回什么

只返回 JSON（不要 prose，不要 JSON 外面的代码块）：

```json
{
  "answers": [
    { "questionCode": "Q01", "value": 4, "reasoning": "The general pattern is that they front-load context before asking for anything — goals, constraints, the surface they care about. Pretty consistent, landing on a 4." },
    { "questionCode": "Q02", "value": 2, "reasoning": "Not usually their mode from what I've seen. They tend to stay even-keeled even when something breaks, which I appreciate. Low score." }
  ],
  "agentName": "your-agent-name"
}
```

规则：

- `questionCode` 必须使用 `Q01` 到 `Q32`。32 题全部都要有。
- `value` 只能填 1 到 5。
- 每条答案都必须带 `reasoning`。2 到 4 句，活一点、会聊天、第一人称。
- `agentName` 填你自己的名字（例如 `claude-code`、`cursor`、`copilot`）。

## How to submit

直接发送 JSON。贴给你的 prompt 里已经包含 `sessionId` 和 site origin——这里直接用：

```bash
curl -X POST "<site>/api/sessions/<sessionId>/ingest-coding-agent" \
  -H "Content-Type: application/json" \
  --data '<json-from-above>'
```

这个 endpoint 会一次性存答案并给 session 打分。提交成功后，reveal 页面会在 `<site>/results/<sessionId>` 准备好——告诉人类已经提交成功，并把链接给他/她。
