#!/usr/bin/env bash
# Hook: prevent-generated-commit
# Trigger: before_git_commit
# Description: Refuse to commit files that look generated (e.g., *.html output from static generator)

set -euo pipefail

# Check if any staged file is a generated HTML file in the output directory
if git diff --cached --name-only | grep -E '^(output|dist|out)/.*\.html$'; then
  echo "✗ Error: You are trying to commit generated HTML files from the output directory."
  echo "   Generated files should not be committed. Remove them from the staging area:"
  echo ""
  git diff --cached --name-only | grep -E '^(output|dist|out)/.*\.html$' | while read -r file; do
    echo "     git reset HEAD $file"
  done
  echo ""
  exit 1
fi

# Allow the commit if no generated files are staged
echo "✓ No generated output files staged for commit"
