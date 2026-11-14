#!/usr/bin/env bash
# Hook: test-on-save
# Trigger: after_file_write
# Description: Run the test suite after a source file is written

set -euo pipefail

# Only run tests if a source or test file was modified
if [[ "$KIRO_FILE_PATH" == *.js ]]; then
  echo "Running tests after file write: $KIRO_FILE_PATH"
  
  # Run the test suite
  if node --test test/**/*.test.js 2>&1; then
    echo "✓ All tests passed"
  else
    echo "✗ Tests failed. Fix errors before continuing."
    exit 1
  fi
fi
