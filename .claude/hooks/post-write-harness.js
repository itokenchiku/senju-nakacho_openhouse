// PostToolUse hook: Write実行後にハーネスエンジニアリング検証を強制
// 成果物を書いたら即座にverifyスクリプトの存在を確認し、なければ警告
const path = require('path');
const fs = require('fs');

let data = '';
process.stdin.on('data', c => data += c);
process.stdin.on('end', () => {
  const input = JSON.parse(data);
  const filePath = input.tool_input?.file_path || '';

  // 検証スクリプト自体、設定ファイル、メモリファイルはスキップ
  const skipPatterns = [
    /verify[-_].*\.sh$/,
    /eval[-_].*\.sh$/,
    /\.claude\//,
    /settings\.json$/,
    /CLAUDE\.md$/,
    /STATUS\.md$/,
    /memory\//,
    /\.git\//,
    /eval_log\.tsv$/,
    /latest-result\.md$/,
  ];

  if (skipPatterns.some(p => p.test(filePath.replace(/\\/g, '/')))) {
    process.exit(0);
  }

  // 成果物判定: 特定の拡張子 or 特定ディレクトリ
  const artifactExtensions = ['.xlsx', '.csv', '.pdf', '.docx'];
  const ext = path.extname(filePath).toLowerCase();
  const isArtifactByExt = artifactExtensions.includes(ext);

  // mdファイルは特定ディレクトリ配下のみ成果物扱い
  const artifactDirs = ['公的様式', '届出', '報告書', 'reports', 'output'];
  const dirName = path.basename(path.dirname(filePath));
  const isArtifactByDir = artifactDirs.some(d => filePath.includes(d));
  const isMdArtifact = ext === '.md' && isArtifactByDir;

  if (!isArtifactByExt && !isMdArtifact) {
    process.exit(0);
  }

  // 同じディレクトリまたは親ディレクトリにverify-*.sh / eval-*.shがあるか確認
  const fileDir = path.dirname(filePath);
  const dirsToCheck = [fileDir, path.dirname(fileDir)];
  let hasVerifyScript = false;

  for (const dir of dirsToCheck) {
    try {
      const entries = fs.readdirSync(dir);
      if (entries.some(e => /^(verify[-_].*|eval[-_].*)\.sh$/.test(e))) {
        hasVerifyScript = true;
        break;
      }
    } catch {}
  }

  if (!hasVerifyScript) {
    // 検証スクリプトが存在しない → 警告を出す
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext:
          '⚠ ハーネスエンジニアリング: 成果物を書きましたが、verify-*.sh が見つかりません。' +
          '検証スクリプトを作成して実行してから次に進んでください。' +
          ' 対象ファイル: ' + path.basename(filePath)
      }
    }));
  } else {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext:
          '✓ ハーネスエンジニアリング: verify スクリプトあり。実行して全項目PASSを確認してから次に進んでください。'
      }
    }));
  }
});
