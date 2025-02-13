#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
echo "Building Payments API docs..."

typedoc \
    --plugin typedoc-plugin-markdown \
    --entryPointStrategy expand \
    --entryPoints '../packages/payments/src' \
    --exclude "../packages/payments/**/*mock*" \
    --exclude "../packages/payments/**/*test*" \
    --exclude "../packages/payments/src/plugin.ts" \
    --exclude "../packages/payments/src/Devvit.d.ts" \
    --tsconfig '../packages/payments/tsconfig.json' \
    --hideBreadcrumbs \
    --disableSources \
    --includeVersion \
    --excludePrivate \
    --namedAnchors \
    --excludeExternals \
    --excludeInternal \
    --readme none \
    --out './docs/api/payments'
