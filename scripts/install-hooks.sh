#!/usr/bin/env bash
# ============================================================
# scripts/install-hooks.sh
# Git hooks 配布スクリプト
#
# .git/hooks/ は git 管理外なので、各PCで一度実行して配布する。
# 主な hook:
#   post-merge: git pull 完了後に setup-pc.sh --auto を自動実行
#
# 使い方:
#   bash scripts/install-hooks.sh
# ============================================================

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"

if [ ! -d "$HOOKS_DIR" ]; then
    echo "ERROR: $HOOKS_DIR が存在しません（git リポジトリではない？）"
    exit 1
fi

echo "Git hooks をインストール中..."

# ── post-merge: git pull / git merge 後に自動実行 ─────────────
cat > "$HOOKS_DIR/post-merge" <<'HOOK_EOF'
#!/usr/bin/env bash
# 自動生成: scripts/install-hooks.sh
# git pull / git merge 完了後に PC 環境を自動同期する

REPO_ROOT="$(git rev-parse --show-toplevel)"
SETUP_SCRIPT="$REPO_ROOT/scripts/setup-pc.sh"

if [ -f "$SETUP_SCRIPT" ]; then
    echo ""
    echo "[post-merge hook] PC環境を自動同期中..."
    bash "$SETUP_SCRIPT" --auto 2>&1 | grep -E "(✓|⚠|✗|━━━)" | head -30
    echo "[post-merge hook] 同期完了"
fi
HOOK_EOF
chmod +x "$HOOKS_DIR/post-merge"
echo "  ✓ post-merge hook 配置"

# ── post-checkout: git checkout でブランチ切替時にも実行 ────
cat > "$HOOKS_DIR/post-checkout" <<'HOOK_EOF'
#!/usr/bin/env bash
# 自動生成: scripts/install-hooks.sh
# ブランチ切替時のみ実行（ファイルcheckoutでは実行しない）
# 引数: $1=旧HEAD $2=新HEAD $3=branch切替フラグ(1=branch / 0=file)

if [ "$3" = "1" ]; then
    REPO_ROOT="$(git rev-parse --show-toplevel)"
    SETUP_SCRIPT="$REPO_ROOT/scripts/setup-pc.sh"
    if [ -f "$SETUP_SCRIPT" ]; then
        echo ""
        echo "[post-checkout hook] PC環境を自動同期中..."
        bash "$SETUP_SCRIPT" --auto 2>&1 | grep -E "(✓|⚠|✗|━━━)" | head -30
    fi
fi
HOOK_EOF
chmod +x "$HOOKS_DIR/post-checkout"
echo "  ✓ post-checkout hook 配置"

echo ""
echo "完了。これ以降 git pull / git checkout 時に setup-pc.sh --auto が自動実行されます。"
