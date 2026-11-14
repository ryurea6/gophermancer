#!/usr/bin/env bash
# Hook: check-crlf
# Trigger: after_file_write
# Description: Verify Gopher codec files use CRLF line endings correctly

set -euo pipefail

# Only check codec and client files
if [[ "$KIRO_FILE_PATH" == *"src/gopher/codec.js" ]] || \
   [[ "$KIRO_FILE_PATH" == *"src/gopher/client.js" ]] || \
   [[ "$KIRO_FILE_PATH" == *"src/gopher/server.js" ]]; then
  
  echo "Checking CRLF correctness in $KIRO_FILE_PATH"
  
  # Search for string literals that should be CRLF
  if grep -n '\\n[^r]' "$KIRO_FILE_PATH" | grep -v '//.*\\n' | grep -v '/\*.*\\n.*\*/' | head -5; then
    echo "⚠ Warning: Found LF-only line endings (\\n) in Gopher protocol code."
    echo "   Gopher requires CRLF (\\r\\n). Review the following lines:"
    grep -n '\\n[^r]' "$KIRO_FILE_PATH" | grep -v '//.*\\n' | grep -v '/\*.*\\n.*\*/' | head -5 || true
    echo ""
    echo "   If these are in comments or unrelated strings, ignore this warning."
    echo "   If they are in protocol encoding, change them to \\r\\n."
  else
    echo "✓ No LF-only line endings found in protocol code"
  fi
fi
