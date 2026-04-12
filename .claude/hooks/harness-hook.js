// ハーネスエンジニアリング 汎用PreToolUse hookスクリプト
// git commit時に verify_*.sh / eval_*.sh を自動検出・実行
// FAILがあればコミットをブロック
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

let data = '';
process.stdin.on('data', c => data += c);
process.stdin.on('end', () => {
  const input = JSON.parse(data);
  const cmd = input.tool_input?.command || '';

  // git commit 以外はスルー
  if (!/git\s+commit/.test(cmd)) process.exit(0);

  // リポジトリルートを検出
  let root;
  try {
    root = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
  } catch { process.exit(0); }

  // verify_*.sh / eval_*.sh を再帰検索（Node.jsのみ、findコマンド不使用）
  function findScripts(dir, depth) {
    if (depth > 5) return [];
    let results = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results = results.concat(findScripts(full, depth + 1));
        } else if (/^(verify[-_].*|eval[-_].*)\.sh$/.test(entry.name)) {
          results.push(full);
        }
      }
    } catch {}
    return results;
  }

  const scripts = findScripts(root, 0);
  if (scripts.length === 0) process.exit(0);

  // 各スクリプトを実行
  let allPass = true;
  let output = '';

  for (const script of scripts) {
    try {
      const scriptPath = script.replace(/\\/g, '/');
      const result = execSync('bash "' + scriptPath + '"', {
        encoding: 'utf8',
        cwd: root
      });
      output += result;
      if (/FAIL:\s*[1-9]/.test(result)) {
        allPass = false;
      }
    } catch (e) {
      output += 'ERROR: ' + script + ': ' + e.message + '\n';
      allPass = false;
    }
  }

  if (!allPass) {
    console.log(JSON.stringify({
      decision: 'block',
      reason: 'ハーネスエンジニアリング検証でFAILあり。修正してからコミットしてください。\n' + output
    }));
  } else {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        additionalContext: 'ハーネスエンジニアリング検証: 全項目PASS (' + scripts.length + 'スクリプト実行)'
      }
    }));
  }
});
