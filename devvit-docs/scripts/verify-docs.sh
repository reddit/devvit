#!/usr/bin/env bash
set -xeuo pipefail

R='\033[0;31m'   #'0;31' is Red's ANSI color code
G='\033[0;32m'   #'0;32' is Green's ANSI color code
RESET='\033[0m'

# Run generation script
echo "Generating API docs...";
yarn gen:api-docs && yarn gen:reddit-api-docs
echo "Linting API docs...";
npx prettier --write '**/*.md'

# Check for unstaged changes
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${R}The docs generation script (yarn docs:gen) resulted in unstaged changes. Please run 'yarn docs:gen' and commit the generated docs.${RESET}";
  git status
  git diff
  exit 1
else
  echo -e "${G}Workspace clean ${RESET}";
fi
