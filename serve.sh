#!/usr/bin/env sh
# Serve the Northlight site locally.
#   ./serve.sh         → http://localhost:8000/
#   ./serve.sh 9000    → pick a port
#
# Always serves from the folder this script lives in, so it works
# no matter what directory you run it from.

PORT="${1:-8000}"
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR" || exit 1

printf '\n  Northlight → http://localhost:%s/\n  Serving:    %s\n  Stop with Ctrl+C\n\n' "$PORT" "$DIR"

if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT"
elif command -v python >/dev/null 2>&1; then
  exec python -m http.server "$PORT"
elif command -v npx >/dev/null 2>&1; then
  exec npx --yes serve -l "$PORT" .
else
  echo "Need python3, python, or npx installed to serve. Install one and retry." >&2
  exit 1
fi
