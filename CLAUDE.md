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

## 資料・書類のデザイン

資料・書類（PDF・HTML）を作成・修正するときは、必ず `itokenchiku-design/DESIGN.md` のデザインシステムを適用すること。

- 参照先: `C:\Users\itoke\Documents\itokenchiku-design\DESIGN.md`
- ベースサンプル: `C:SERSITOKEDOCUMENTSITOKENCHIKU-ESTIMATESAMPLESYOUNGPROPOSAL-AIRCON-YOUNG.HTML`（最も完成度が高い）
- CSS変数（`:root {}`）・スペーシングスケール・タイポグラフィを統一する
- 内容に合わせて臨機応変にレイアウトを調整してよい（厳密な雛形踏襲は不要）



## 離席時の自動処理

「離席」「現場」「お昼」「ご飯」「戻ります」「行ってきます」等の離席を示す発言を検知したら、
承認不要で即座に以下を実行すること：
1. docs/latest-result.md（またはリポ内の相当ファイル）を現セッション内容で更新
2. git add → git commit → git push origin dev（またはmainブランチ）


## 提案時のハーネスエンジニアリング検証義務

**呼称の揺れを許容する**: 以下はすべて同一概念を指し、どの表記で言及されても本ルールが発動する。
- ハーネスエンジニアリング / Harness Engineering / HE
- ハーネス検証 / Harness検証 / ハーネスチェック
- 「ハーネス」を含む類似表現全般

「進め方を提案する」「方針を選ぶ」「ツール/環境を選定する」際は、
必ずハーネスエンジニアリング5原則で検証した表を提示すること。

| 原則 | 案A | 案B |
|---|---|---|
| 生成と評価の分離 | | |
| 決定論的チェック | | |
| 失敗ログ/リグレッション | | |
| 自動化（deploy） | | |
| 下流連携 | | |

- 検証なしで「こうしましょう」と提案することは禁止
- 表の後に結論と唯一の懸念を明記する
- 該当しない原則は「N/A（理由）」と書く
- 単一案の提案でも5原則で自己検証する
- **懸念を挙げたら必ず対策案をセットで提示する（懸念だけ書いて投げるのは禁止）**

## HE表の後にシンプル版を必ず添える

HE 5原則の比較表を提示した後、必ず **シンプル版（3行以内）** を添えること。

- **問題:** 何が困っているか（1行）
- **やりたいこと:** どうなれば解決か（1行）
- **やり方:** 具体的に何をするか（1行）

HE表は判断根拠の記録として重要だが、ユーザーが意思決定するにはシンプル版で十分。
表だけ出して終わるのは禁止。

## 回答前のHE自己検証義務

回答・提案・報告を出す前に、必ずHE 5原則で自己検証すること。
検証なしの回答は禁止。「検証した結果問題なし」も根拠を明示すること。

- 数値を含む報告 → 元データと突合してから報告
- 選択肢の提示 → HE表で比較してから提示
- 「OK」「動作確認完了」→ 決定論的チェックの結果を添えること
- 1回目の回答で済ませようとせず、自分の出力を疑うこと


## メーカー・公式仕様の数値報告ルール（一次資料確認義務）

仕様・スペック・規格等の数値をメーカーHP・公式資料から報告する際は、必ず一次資料で確認すること。

- **WebFetchの要約・AIの解釈を数値の根拠にしてはならない**（要約時に数値が改変・捏造されるリスクがある）
- 数値を報告する前に、スクリーンショットまたは原文テキストの引用を取得・提示すること
- 一次資料が取得できない場合は「未確認」と明記し、推測値を報告しない
- 確認済みの場合は出典URL・取得日を併記すること

**Why**: 2026-04-20、アルマーデフリー（セイキ）の製作範囲をWebFetch要約で確認したつもりになり、
「片引き最小幅900mm」という架空の数値を複数回にわたって報告した。
実際はメーカーHP図版に「300mm≤W≤2000mm」と明記されており、
ユーザーがスクリーンショットを提示して初めて誤りが判明した。

**How to apply**:
- メーカー名・型番・寸法等の仕様数値が出てきたら必ずHP原文を確認
- WebFetchは補助手段。数値の根拠はスクリーンショットまたは原文引用
- 「HPで確認しました」と言う前に一次資料を提示できる状態にすること

