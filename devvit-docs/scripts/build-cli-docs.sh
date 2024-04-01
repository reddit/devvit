#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
echo "Building Devvit CLI docs..."
cd "../../packages/cli"
npx oclif readme --dir ../../devvit-docs/docs/cli --multi
