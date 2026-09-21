#!/usr/bin/env bash
# Bouwt de site en publiceert dist/ op de gh-pages branch.
# De org-policy van TBI-AI-team eist commit-SHA-pinning voor alle actions,
# waardoor actions/upload-pages-artifact (die intern upload-artifact@v4
# ongepind aanroept) niet mag draaien. Daarom deployen we vanaf de branch.
set -euo pipefail

cd "$(dirname "$0")"
npm ci
npm run build

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cp -R dist/. "$tmp/"
# Vite laat .git staan bij het legen van dist/; die mag niet mee de branch in.
rm -rf "$tmp/.git"
touch "$tmp/.nojekyll"

remote="$(git remote get-url origin)"
rev="$(git rev-parse --short HEAD)"

git -C "$tmp" init -q -b gh-pages
git -C "$tmp" add -A
git -C "$tmp" commit -q -m "Deploy vanaf $rev"
git -C "$tmp" push -q -f "$remote" gh-pages

echo "Gepubliceerd: https://tbi-ai-team.github.io/tdi500-3.3-slimwonen-monitor/"
