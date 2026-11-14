#!/usr/bin/env bash
# Hook: lint-on-commit
# Trigger: before_git_commit
# Description: Run basic linting checks on staged JavaScript files before commit

set -euo pipefail

echo "Running pre-commit checks on staged JavaScript files..."

# Get list of staged .js files
staged_js_files=$(git diff --cached --name-only --diff-filter=ACM | grep '\.js$' || true)

if [[ -z "$staged_js_files" ]]; then
  echo "✓ No JavaScript files staged for commit"
  exit 0
fi

# Check for syntax errors by parsing with Node.js
echo "Checking syntax..."
syntax_errors=0
for file in $staged_js_files; do
  if [[ -f "$file" ]]; then
    if ! node --check "$file" 2>&1; then
      echo "✗ Syntax error in $file"
      syntax_errors=$((syntax_errors + 1))
    fi
  fi
done

if [[ $syntax_errors -gt 0 ]]; then
  echo "✗ Found $syntax_errors file(s) with syntax errors. Fix them before committing."
  exit 1
fi

# Check for common mistakes: console.log in production code (allow in test files)
echo "Checking for console.log in source files..."
console_log_found=0
for file in $staged_js_files; do
  if [[ "$file" != test/* ]] && [[ -f "$file" ]]; then
    if grep -n 'console\.log' "$file" | grep -v '//.*console\.log' | head -3; then
      echo "⚠ Warning: Found console.log in $file"
      console_log_found=$((console_log_found + 1))
    fi
  fi
done

if [[ $console_log_found -gt 0 ]]; then
  echo "⚠ Warning: Found console.log in $console_log_found file(s). Consider removing or replacing with proper logging."
  echo "   (This is a warning, not an error. Commit will proceed.)"
fi

echo "✓ Pre-commit checks passed"
