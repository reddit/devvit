#!/usr/bin/env bash
set -xeuo pipefail

R='\033[0;31m'   #'0;31' is Red's ANSI color code
G='\033[0;32m'   #'0;32' is Green's ANSI color code
RESET='\033[0m'

# Run generation script
echo "Generating API docs...";
yarn gen:api-docs && yarn gen:reddit-api-docs
echo "Linting API docs...";
# Only format markdown files tracked by git (excludes submodules)
# Explicitly exclude docs/spec/headers.md as it is a generated file that is not formatted correctly by prettier
git ls-files '*.md' ':!/docs/spec/headers.md' | xargs npx prettier --write

# Check for unstaged changes
if [ -n "$(git status --porcelain)" ]; then
  git status
  git diff

  # Give stdout a little time to handle all the output from git diff before printing the helpful suggestion
  sleep 2;

  echo -e "${R}The docs generation script (yarn docs:gen) resulted in unstaged changes. Please run 'devvit-docs/scripts/verify-docs.sh' and commit the generated docs.${RESET}";
  exit 1
else
  echo -e "${G}Workspace clean ${RESET}";
fi
