#!/usr/bin/env bash
# Every pull request adds a short note under changes/ describing its user-visible change.
set -euo pipefail
base="${1:?usage: check-changes.sh <base-ref>}"
if ! git diff --name-only --diff-filter=A "$base"...HEAD | grep -q '^changes/'; then
  echo "::error::No change note. Add a new file under changes/ (for example changes/<short-name>.md) with one line describing this change."
  exit 1
fi
