#!/bin/sh

set -e

BUMP=${1:-patch}

if [ "$BUMP" != "patch" ] && [ "$BUMP" != "minor" ] && [ "$BUMP" != "major" ]; then
  echo "Usage: ./scripts/create-release.sh [patch|minor|major]"
  exit 1
fi

git checkout main
git pull origin main

npm version "$BUMP" --no-git-tag-version

VERSION=$(bun -e "console.log(require('./package.json').version)")
BRANCH="release/v$VERSION"

git checkout -b "$BRANCH"
git add package.json
git commit -m "chore: bump version to v$VERSION"
git push origin "$BRANCH"

echo ""

echo "✅ Branch $BRANCH created and pushed"
echo "👉 Open a PR: $BRANCH → main"
