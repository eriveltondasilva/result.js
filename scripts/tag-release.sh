#!/bin/sh

set -e

git checkout main
git pull origin main

VERSION=$(bun -e "console.log(require('./package.json').version)")
TAG="v$VERSION"

if git tag | grep -q "^$TAG$"; then
  echo "❌ Tag $TAG already exists"
  exit 1
fi

git tag "$TAG"
git push origin "$TAG"

echo "✅ Tag $TAG pushed — deploy triggered"
