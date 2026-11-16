#!/usr/bin/env bash
# Local Codespace preview only. Never deploys to GitHub Pages or opens a public endpoint.
set -euo pipefail
cd "$(dirname "$0")/.."
if curl --silent --fail http://127.0.0.1:8000/index.html >/dev/null 2>&1; then
  echo "Neural Orchard private QA server already running on port 8000."
  exit 0
fi
nohup python3 -m http.server 8000 --bind 0.0.0.0 > /tmp/neural-orchard-qa-http.log 2>&1 < /dev/null &
echo "Started local Neural Orchard QA server on port 8000."
echo "Codespaces > PORTS: confirm port 8000 visibility is PRIVATE before opening."
echo "Open /index.html, /Stargaizer.html or /Sentinel.html after forwarding."
