#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
echo "Building Devvit API docs..."

typedoc \
    --plugin typedoc-plugin-markdown \
    --entryPoints '../packages/public-api/src/index.ts' \
    --exclude "../packages/public-api/src/apis/reddit/**/*.ts" \
    --tsconfig '../packages/public-api/tsconfig.json' \
    --hideBreadcrumbs \
    --disableSources \
    --useHTMLAnchors \
    --includeVersion \
    --excludePrivate \
    --excludeExternals \
    --excludeInternal \
    --readme none \
    --out './docs/api/public-api'
