#!/usr/bin/env bash
set -e

# Release helper - 推送代码到 4.0 分支
# release-please 会自动创建/更新发布 PR
# 合并发布 PR 即可触发自动发布

echo "=== OCS Release Helper ==="
echo ""
echo "将推送代码到 4.0 分支，release-please 会自动创建/更新发布 PR。"
echo "合并发布 PR 即可触发自动发布。"
echo ""

echo "Running lint check..."
npm run lint

echo ""
echo "Lint 通过，推送到 origin/4.0..."
git push origin 4.0

echo ""
echo "完成！请到 GitHub 查看 release-please 的发布 PR。"
echo "审核并合并发布 PR 即可创建新的 Release。"
