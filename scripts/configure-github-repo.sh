#!/usr/bin/env bash
set -euo pipefail

# Configures GitHub repository settings required by this CI/CD pipeline.
# Steps automated:
# 1) Enable GitHub Actions workflows.
# 2) Set workflow permissions to read/write.
# 3) Configure GitHub Pages to deploy from gh-pages branch.

usage() {
  cat <<'EOF'
Usage:
  bash scripts/configure-github-repo.sh [owner/repo]

Examples:
  bash scripts/configure-github-repo.sh
  bash scripts/configure-github-repo.sh octocat/hello-world

Notes:
  - Requires GitHub CLI (gh) to be installed and authenticated.
  - If no repository is provided, the script uses the current gh repo context.
  - The gh-pages branch must exist before Pages source can be configured.
EOF
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: '$cmd' is required but not found in PATH." >&2
    exit 1
  fi
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

require_cmd gh

if ! gh auth status >/dev/null 2>&1; then
  echo "Error: gh is not authenticated. Run: gh auth login" >&2
  exit 1
fi

REPO="${1:-}"
if [[ -z "$REPO" ]]; then
  REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
fi

if [[ -z "$REPO" ]]; then
  echo "Error: Could not determine repository. Pass it explicitly as owner/repo." >&2
  exit 1
fi

echo "Configuring repository: $REPO"

if ! gh api "repos/$REPO/branches/gh-pages" >/dev/null 2>&1; then
  echo "Error: Branch 'gh-pages' does not exist in $REPO." >&2
  echo "Create and push the branch first, then re-run this script." >&2
  exit 1
fi

echo "1/3 Enabling GitHub Actions workflows..."
gh api \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  "repos/$REPO/actions/permissions" \
  -f enabled=true \
  -f allowed_actions=all >/dev/null

echo "2/3 Setting workflow permissions to read/write..."
gh api \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  "repos/$REPO/actions/permissions/workflow" \
  -f default_workflow_permissions=write \
  -F can_approve_pull_request_reviews=false >/dev/null

echo "3/3 Configuring GitHub Pages source to gh-pages..."
if gh api "repos/$REPO/pages" >/dev/null 2>&1; then
  gh api \
    -X PUT \
    -H "Accept: application/vnd.github+json" \
    "repos/$REPO/pages" \
    -F source[branch]=gh-pages \
    -F source[path]="/" >/dev/null
else
  gh api \
    -X POST \
    -H "Accept: application/vnd.github+json" \
    "repos/$REPO/pages" \
    -F source[branch]=gh-pages \
    -F source[path]="/" >/dev/null
fi

echo "Validating applied settings..."
ACTIONS_ENABLED="$(gh api "repos/$REPO/actions/permissions" -q .enabled)"
WORKFLOW_PERMS="$(gh api "repos/$REPO/actions/permissions/workflow" -q .default_workflow_permissions)"
PAGES_BRANCH="$(gh api "repos/$REPO/pages" -q .source.branch)"

cat <<EOF
Done.
- Actions enabled: $ACTIONS_ENABLED
- Workflow permissions: $WORKFLOW_PERMS
- Pages source branch: $PAGES_BRANCH
EOF
