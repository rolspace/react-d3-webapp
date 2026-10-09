#!/usr/bin/env bash
set -euo pipefail

sudo corepack enable

# Named volumes are created root-owned; let the node user write Claude Code config.
sudo chown -R "$(id -u):$(id -g)" "$HOME/.claude"
yarn install --immutable

if [ ! -f src/.env ]; then
  cp .env.example src/.env
  echo "Created src/.env from .env.example - fill in the GitHub credentials and SESSION_SECRET."
fi

if [ ! -f src/backend/certs/cert.pem ]; then
  (cd src/backend/certs && ./generate-certs.sh)
fi
