// UserPromptSubmit hook: 「再起動」「出社」「帰宅」等のキーワードを検知して
// 未コミット変更と未プッシュコミットを **自動コミット・自動プッシュ** する
//
// 設計原則: 自動が前提・手動は最小限
//
// 動作:
//   1. キーワード検知（出社・帰宅・終了 等）
//   2. 未トラック / 未コミット変更があれば git add -A && commit
//   3. 未プッシュコミットがあれば git push
//   4. 結果を Claude のコンテキストに通知

const { execSync } = require('child_process');

let data = '';
process.stdin.on('data', c => data += c);
process.stdin.on('end', () => {
  const input = JSON.parse(data);
  const prompt = (input.prompt || '').toLowerCase();

  const triggers = [
    '再起動', 'restart',
    '帰ります', '帰宅', '続きは自宅', '続きは事務所',
    '出社します', 'いってきます', 'おわり', '終わり', '終了',
    'お疲れ', 'おつかれ',
    '離席', '現場', 'お昼', 'ご飯', 'セッション終了',
    '行ってきます', '行って来ます'
  ];

  const matched = triggers.some(t => prompt.includes(t));
  if (!matched) {
    process.exit(0);
  }

  const messages = [];
  messages.push('━━━ 退出キーワード検知 → 自動同期 ━━━');

  const exec = (cmd) => execSync(cmd, { encoding: 'utf-8', timeout: 30000 }).trim();

  // ステップ1: 未コミット変更チェック
  let status = '';
  try {
    status = exec('git status --porcelain');
  } catch (e) {
    messages.push('✗ git status 失敗: ' + e.message);
    output(messages);
    return;
  }

  // ステップ2: 未コミット変更があれば自動 add + commit
  if (status) {
    const files = status.split('\n').map(l => l.trim()).filter(Boolean);
    messages.push(`📝 未コミット変更 ${files.length}件:`);
    files.slice(0, 10).forEach(f => messages.push(`   ${f}`));
    if (files.length > 10) messages.push(`   ... 他 ${files.length - 10}件`);

    try {
      exec('git add -A');
      const ts = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
      const msg = `wip: 退出時自動コミット ${ts}\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`;
      // git commit はメッセージにダブルクォートを含むので一時ファイル経由
      const tmpFile = require('os').tmpdir() + '/claude-commit-msg-' + process.pid;
      require('fs').writeFileSync(tmpFile, msg, 'utf-8');
      try {
        exec(`git commit -F "${tmpFile}"`);
        messages.push('✓ 自動コミット完了');
      } finally {
        try { require('fs').unlinkSync(tmpFile); } catch (e) {}
      }
    } catch (e) {
      messages.push('✗ 自動コミット失敗: ' + (e.message || e).toString().split('\n')[0]);
    }
  } else {
    messages.push('✓ 未コミット変更なし');
  }

  // ステップ3: 未プッシュコミットチェック → 自動プッシュ
  try {
    const branch = exec('git symbolic-ref --short HEAD');
    let unpushed = '';
    try {
      unpushed = exec('git log --oneline @{u}..HEAD');
    } catch (e) {
      // upstream 未設定
    }

    if (unpushed) {
      messages.push(`📤 未プッシュコミット:`);
      unpushed.split('\n').forEach(l => messages.push(`   ${l}`));
      try {
        exec(`git push origin ${branch}`);
        messages.push('✓ 自動プッシュ完了');
      } catch (e) {
        messages.push('✗ 自動プッシュ失敗: ' + (e.message || e).toString().split('\n')[0]);
      }
    } else {
      messages.push('✓ 未プッシュなし');
    }
  } catch (e) {
    // git 関連エラーは無視
  }

  messages.push('━━━━━━━━━━━━━━━━━━━━━━━━');
  output(messages);
});

function output(messages) {
  const result = {
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: messages.join('\n')
    }
  };
  process.stdout.write(JSON.stringify(result));
}
