#!/usr/bin/env bash
set -euo pipefail

# First, figure out what rc file we need to change
RC_FILE=~/.zshrc
if [[ ! -f "$RC_FILE" ]]; then
  # Fallback to bash
  RC_FILE=~/.bashrc
fi
if [[ ! -f "$RC_FILE" ]]; then
  # ...how are you even running this?
  echo "RC file not found, please add this to your shell manually:"
  echo "$line"
  exit
fi

# cd to the packages/cli directory
cd "$(dirname "$0")/.."
line="export PATH=\$PATH:$PWD"

# only add to the RC file if we haven't before
if ! grep -q "$line" "$RC_FILE"; then
  echo "Adding to your PATH to $RC_FILE"
  echo "$line" >> "$RC_FILE"
else
  echo "PATH already set in $RC_FILE"
fi

echo
echo "Installation complete"
echo
