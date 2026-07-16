#!/bin/bash
# Tulpa Helper — 一键推送到 GitHub
# 用法: bash push-to-github.sh YOUR_GITHUB_USERNAME

set -e
GH_USER="${1:?请提供 GitHub 用户名}"
REPO="tulpa-helper"

cd /root/tulpa-helper

# 如果已配置 remote 则跳过
if ! git remote get-url origin &>/dev/null; then
  git remote add origin "https://github.com/${GH_USER}/${REPO}.git"
fi

# 拉取最新（如果 repo 已存在）
git pull origin master --rebase 2>/dev/null || true

# 推送
git push -u origin master

echo ""
echo "✅ 推送完成"
echo "📦 CI 构建: https://github.com/${GH_USER}/${REPO}/actions"
echo "⬇ 构建完成后在 Actions → 最新 run → Artifacts 下载安装包"

