#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
echo "Building Reddit API docs..."

typedoc \
    --plugin typedoc-plugin-markdown \
    --entryPoints '../packages/public-api/src/apis/reddit/RedditAPIClient.ts' \
    --entryPoints '../packages/public-api/src/apis/reddit/models' \
    --tsconfig '../packages/public-api/tsconfig.json' \
    --hideBreadcrumbs \
    --disableSources \
    --includeVersion \
    --excludePrivate \
    --useHTMLAnchors \
    --excludeExternals \
    --excludeInternal \
    --readme none \
    --out './docs/api/redditapi'
