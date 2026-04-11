#!/usr/bin/env bash
# ============================================================
# scripts/setup-pc.sh (portable / minimal)
# 全リポ共通のPC環境同期スクリプト（軽量版）
#
# 機能:
#   1. .vscode/extensions.json の unwantedRecommendations を自動アンインストール
#   2. 必要最小限の動作確認
#
# 使い方:
#   bash scripts/setup-pc.sh           通常実行
#   bash scripts/setup-pc.sh --auto    post-merge hook 用（出力最小）
#   bash scripts/setup-pc.sh --check   確認のみ
#
# 注: 各リポ固有の処理（pip install / .env / token等）はこのスクリプトには含めず、
#     必要に応じて各リポで scripts/setup-pc.sh を上書き拡張すること。
# ============================================================

set -e

# ── 色 ────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ok()    { echo -e "  ${GREEN}✓${NC} $1"; }
warn()  { echo -e "  ${YELLOW}⚠${NC} $1"; }
err()   { echo -e "  ${RED}✗${NC} $1"; }
info()  { echo -e "  ${BLUE}ℹ${NC} $1"; }
section() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }

# ── 引数解析 ──────────────────────────────────────────
AUTO=0
CHECK_ONLY=0
for arg in "$@"; do
    case "$arg" in
        --auto)  AUTO=1 ;;
        --check) CHECK_ONLY=1 ;;
        --help|-h)
            echo "Usage: bash scripts/setup-pc.sh [--auto] [--check]"
            exit 0
            ;;
    esac
done

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_NAME="$(basename "$REPO_ROOT")"
cd "$REPO_ROOT"

if [ "$AUTO" = "0" ]; then
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  $REPO_NAME PC環境セットアップ${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
fi

# ============================================================
section "VS Code 不要拡張機能のアンインストール"
# ============================================================

EXT_JSON="$REPO_ROOT/.vscode/extensions.json"
VSCODE_BIN="/c/Users/itoke/AppData/Local/Programs/Microsoft VS Code/bin/code"

if [ ! -f "$EXT_JSON" ]; then
    info ".vscode/extensions.json が無いためスキップ"
elif [ ! -f "$VSCODE_BIN" ] && ! command -v code >/dev/null 2>&1; then
    info "VS Code が PATH に無いためスキップ"
else
    CODE_CMD="${VSCODE_BIN}"
    [ ! -f "$VSCODE_BIN" ] && CODE_CMD="code"

    # unwantedRecommendations を抽出（python で JSON パース）
    UNWANTED_LIST=$(python -c "
import json, sys
try:
    with open(r'$EXT_JSON', 'r', encoding='utf-8') as f:
        data = json.load(f)
    for ext in data.get('unwantedRecommendations', []):
        print(ext)
except Exception as e:
    pass
" 2>/dev/null)

    if [ -z "$UNWANTED_LIST" ]; then
        ok "unwantedRecommendations なし"
    else
        INSTALLED_LIST=$("$CODE_CMD" --list-extensions 2>&1)
        REMOVED=0
        while IFS= read -r ext; do
            [ -z "$ext" ] && continue
            if echo "$INSTALLED_LIST" | grep -qi "^$ext$"; then
                warn "不要拡張: $ext がインストール済み"
                if [ "$CHECK_ONLY" = "0" ]; then
                    "$CODE_CMD" --uninstall-extension "$ext" 2>&1 | tail -1
                    REMOVED=$((REMOVED + 1))
                fi
            fi
        done <<< "$UNWANTED_LIST"
        if [ "$REMOVED" = "0" ]; then
            ok "全て削除済み"
        else
            ok "$REMOVED 個アンインストール"
        fi
    fi
fi

# ============================================================
section "完了"
# ============================================================
ok "セットアップ完了"
