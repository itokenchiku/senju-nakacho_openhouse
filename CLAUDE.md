# 千住仲町オープンハウス

千住仲町プロジェクトのオープンハウス関連資料。

## 複数PC間の引き継ぎ

セッション終了時、必ず以下を実行すること:
1. `docs/latest-result.md` に実施内容・完了状態・次のアクション・発見した問題を書き出す（毎回上書き）
2. `git add` → `git commit` → `git push origin main` を実行（他PCで続きができるようにする）

セッション開始時:
- `docs/latest-result.md` を読んで前回の続きから作業を開始する


---
## Karpathy Guidelines

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
\`\`\`
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
\`\`\`

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 常に使うビジネス用語（ユーザー指定）

提案・整理・報告・HE表のすべての場面でこれらの用語を自然に使うこと。

| 用語 | 使うタイミング |
|---|---|
| **MECE** | 構造化・整理（漏れ・重複なし） |
| **As-Is / To-Be** | 現状分析→改善案をセットで示す |
| **スコープ** | やること/やらないことの境界を引く |
| **デシジョンログ** | 判断理由・却下案・採用理由を記録 |
| **MVP** | 最小限・最速実装を提案する |
| **PoC** | 完成度より検証優先を伝える |
| **PDCA** | サイクル全体を依頼する |
| **ボトルネック** | 問題の絞り込みをする |
| **依存関係** | 実行順序・リスクを整理する |
| **フィジビリティ** | 実現可能性を検証する |
