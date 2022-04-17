#!/usr/bin/env bash

# 自动发布npm包

# 从控制台获取需要发布的版本
read -p "请输入需要发布的版本: " version
# 判断是否为空
if [ -z "$version" ]; then
    echo "版本号不能为空!"
    exit 1
fi
# 确认是否发布版本
read -p "确认发布版本 $version ? [y/n]: " isRelease
# 判断是发布，还是取消发布
if [ "$isRelease" = "y" ]; then
    # 发布
    echo "版本发布 $version"

    # 代码检查
    npm run lint
    # 更新版本
    npm version "$version" --no-git-tag-version
    # 更新日志
    npm run changelog
    # 构建
    npm run build:core
    # 保存
    git add --all
    git tag "$version"
    git commit -m "version release $version"
    # 发布
    npm publish
    echo "$version 发布成功"
elif [ "$isRelease" = "n" ]; then
    echo "取消发布"
else 
    echo "输入有误"
fi

 
