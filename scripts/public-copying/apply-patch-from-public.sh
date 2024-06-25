#!/bin/bash
set -euo pipefail

BRANCH_NAME="public-import--${GITHUB_REF_NAME}" # This is an ENV var we get from GH Actions

# Clone the public repo
git clone https://github.com/reddit/devvit.git
cd devvit

# If the last commit was authored by Redditbara, don't do anything - it's a copy from private to public, we don't need to go back
LAST_COMMIT_USER=`git log -1 --pretty=format:'%an'`
if [ "$LAST_COMMIT_USER" == "Redditbara" ]; then
  echo "Last commit was authored by Redditbara, skipping"
  exit 0
fi

# Get the diff for the last (squashed) merge in public
PATCH_FILENAME=`git format-patch -1 HEAD`
mv "$PATCH_FILENAME" ..
cd ..

# Apply it to private in a new branch
git clone git@github.snooguts.net:reddit/reddit-devplatform-monorepo.git
cd reddit-devplatform-monorepo
git checkout -b "$BRANCH_NAME"

# Applying the patch requires us to do some special handling:

# 1) For each README.md, if there's a README_public.md, apply the patch to that file
# (except at the repo root, that's special)
mv README.md README.md.tmp
mv README.PUBLIC.md README.md
find . -name 'README.md' -exec bash -c 'if [ -f `dirname $0`/README_public.md]; then; mv $0 `dirname $0`/README.md.tmp; mv `dirname $0`/README_public.md $0; fi;' {} \;

# 2) Apply the patch
git apply "../$PATCH_FILENAME"

# 3) Move everything back
mv README.md README.PUBLIC.md
mv README.md.tmp README.md
find . -name 'README.md.tmp' -exec bash -c 'mv `dirname $0`/README.md `dirname $0`/README_public.md; mv $0 `dirname $0`/README.md; fi;' {} \;

# Commit & push this branch up & open a PR for it
git add -A
git commit -m "Import from public"
git push origin "$BRANCH_NAME"
gh pr create --title "[COPYBARA-SKIP] Import from public" --body "This was merged into the public repo's main. Please review it to make sure we copied it over right, and merge away!" --head "$BRANCH_NAME" --base main
