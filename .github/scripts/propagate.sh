#!/usr/bin/env bash
set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN env var is required}"
: "${NEW_VERSION:?NEW_VERSION env var is required}"
: "${SITE_OWNER:?SITE_OWNER env var is required}"
: "${SITE_REPO:?SITE_REPO env var is required}"

APP_PATH="deno.json"
BRANCH_NAME="chore/bump-apps"
LABEL_NAME="apps-bump"
LABEL_COLOR="0E8A16"
LABEL_DESCRIPTION="Automated bump of deco-cx/apps"
CDN_PATTERN="cdn.jsdelivr.net/gh/deco-cx/apps@"

API="https://api.github.com"
REPO="${SITE_OWNER}/${SITE_REPO}"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

log() { echo "[${REPO}] $*" >&2; }

# api METHOD PATH [JSON_BODY] [OUTPUT_FILE]
# Prints HTTP status. Writes body to OUTPUT_FILE (default /dev/null).
# Returns 000 on network error so callers always get a status.
api() {
  local method=$1 path=$2 body="${3:-}" out="${4:-/dev/null}"
  local args=(
    -sS -X "${method}"
    -H "Authorization: Bearer ${GH_TOKEN}"
    -H "Accept: application/vnd.github+json"
    -H "X-GitHub-Api-Version: 2022-11-28"
    -o "${out}" -w "%{http_code}"
  )
  if [[ -n "${body}" ]]; then
    args+=(-H "Content-Type: application/json" --data-raw "${body}")
  fi
  curl "${args[@]}" "${API}${path}" || echo "000"
}

# api_retry: retries on 000/5xx with exponential backoff.
api_retry() {
  local method=$1 path=$2 body="${3:-}" out="${4:-/dev/null}"
  local attempt=1 max=3 delay=2 status
  while true; do
    status=$(api "${method}" "${path}" "${body}" "${out}")
    if [[ "${status}" =~ ^(000|5[0-9][0-9])$ ]] && (( attempt < max )); then
      log "  ${method} ${path} -> ${status}; retrying in ${delay}s (${attempt}/${max})"
      sleep "${delay}"
      attempt=$(( attempt + 1 ))
      delay=$(( delay * 2 ))
      continue
    fi
    echo "${status}"
    return 0
  done
}

fail() {
  local msg=$1 file=${2:-}
  log "!! ${msg}"
  if [[ -n "${file}" && -s "${file}" ]]; then cat "${file}" >&2; fi
  exit 1
}

log "==> Propagating apps@${NEW_VERSION}"

# --- 1. Fetch deno.json from main -------------------------------------------
MAIN_FILE="${TMP_DIR}/main-file.json"
status=$(api_retry GET "/repos/${REPO}/contents/${APP_PATH}?ref=main" "" "${MAIN_FILE}")
case "${status}" in
  200) ;;
  404) log "!! Skipping: ${APP_PATH} not found on main"; exit 0 ;;
  *)   fail "Failed to read ${APP_PATH} from main (HTTP ${status})" "${MAIN_FILE}" ;;
esac

MAIN_FILE_SHA=$(jq -r '.sha' "${MAIN_FILE}")
MAIN_CONTENT="${TMP_DIR}/main-content.txt"
jq -r '.content' "${MAIN_FILE}" | base64 -d > "${MAIN_CONTENT}"

# Verify this file actually references deco-cx/apps
if ! grep -q "${CDN_PATTERN}" "${MAIN_CONTENT}"; then
  log "!! Skipping: ${APP_PATH} does not reference deco-cx/apps"
  exit 0
fi

# Build new content replacing any existing version with the new one
NEW_CONTENT="${TMP_DIR}/new-content.txt"
sed "s|${CDN_PATTERN}[^/]*/|${CDN_PATTERN}${NEW_VERSION}/|g" "${MAIN_CONTENT}" > "${NEW_CONTENT}"

# Skip if main already has the correct version
if cmp -s "${NEW_CONTENT}" "${MAIN_CONTENT}"; then
  log "!! Skipping: already on apps@${NEW_VERSION}"
  exit 0
fi

# --- 2. Ensure branch exists ------------------------------------------------
REF_FILE="${TMP_DIR}/ref.json"
status=$(api_retry GET "/repos/${REPO}/git/ref/heads/${BRANCH_NAME}" "" "${REF_FILE}")
BRANCH_FILE_SHA=""
CONTENT_ON_BRANCH=""

if [[ "${status}" == "404" ]]; then
  log "  Creating branch ${BRANCH_NAME} from main"
  MAIN_REF_FILE="${TMP_DIR}/main-ref.json"
  status=$(api_retry GET "/repos/${REPO}/git/ref/heads/main" "" "${MAIN_REF_FILE}")
  [[ "${status}" == "200" ]] || fail "Failed to resolve main ref (HTTP ${status})" "${MAIN_REF_FILE}"
  MAIN_HEAD_SHA=$(jq -r '.object.sha' "${MAIN_REF_FILE}")

  create_body=$(jq -n --arg ref "refs/heads/${BRANCH_NAME}" --arg sha "${MAIN_HEAD_SHA}" \
    '{ref: $ref, sha: $sha}')
  CREATE_REF_FILE="${TMP_DIR}/create-ref.json"
  status=$(api_retry POST "/repos/${REPO}/git/refs" "${create_body}" "${CREATE_REF_FILE}")
  [[ "${status}" == "201" ]] || fail "Failed to create branch (HTTP ${status})" "${CREATE_REF_FILE}"

  # Re-fetch SHA from the new branch (main may have moved since we last read it)
  BRANCH_FILE="${TMP_DIR}/branch-file.json"
  status=$(api_retry GET "/repos/${REPO}/contents/${APP_PATH}?ref=${BRANCH_NAME}" "" "${BRANCH_FILE}")
  [[ "${status}" == "200" ]] || fail "Failed to read ${APP_PATH} from ${BRANCH_NAME} (HTTP ${status})" "${BRANCH_FILE}"
  BRANCH_FILE_SHA=$(jq -r '.sha' "${BRANCH_FILE}")

elif [[ "${status}" == "200" ]]; then
  BRANCH_FILE="${TMP_DIR}/branch-file.json"
  status=$(api_retry GET "/repos/${REPO}/contents/${APP_PATH}?ref=${BRANCH_NAME}" "" "${BRANCH_FILE}")
  [[ "${status}" == "200" ]] || fail "Failed to read ${APP_PATH} from ${BRANCH_NAME} (HTTP ${status})" "${BRANCH_FILE}"
  BRANCH_FILE_SHA=$(jq -r '.sha' "${BRANCH_FILE}")
  CONTENT_ON_BRANCH="${TMP_DIR}/branch-content.txt"
  jq -r '.content' "${BRANCH_FILE}" | base64 -d > "${CONTENT_ON_BRANCH}"
else
  fail "Unexpected status resolving branch (HTTP ${status})" "${REF_FILE}"
fi

# --- 3. Update file on branch if needed -------------------------------------
if [[ -n "${CONTENT_ON_BRANCH}" ]] && cmp -s "${NEW_CONTENT}" "${CONTENT_ON_BRANCH}"; then
  log "  ${APP_PATH} on ${BRANCH_NAME} already points to apps@${NEW_VERSION}; skipping commit"
else
  log "  Committing ${APP_PATH} on ${BRANCH_NAME}"
  content_b64=$(base64 -w 0 < "${NEW_CONTENT}")
  put_body=$(jq -n \
    --arg message "chore: bump apps to ${NEW_VERSION}" \
    --arg content "${content_b64}" \
    --arg sha "${BRANCH_FILE_SHA}" \
    --arg branch "${BRANCH_NAME}" \
    '{message: $message, content: $content, sha: $sha, branch: $branch,
      committer: {name: "decobot", email: "decobot@users.noreply.github.com"},
      author:    {name: "decobot", email: "decobot@users.noreply.github.com"}}')
  PUT_FILE="${TMP_DIR}/put.json"
  status=$(api_retry PUT "/repos/${REPO}/contents/${APP_PATH}" "${put_body}" "${PUT_FILE}")
  [[ "${status}" == "200" || "${status}" == "201" ]] \
    || fail "Failed to update file (HTTP ${status})" "${PUT_FILE}"
fi

# --- 4. Ensure label exists -------------------------------------------------
label_body=$(jq -n --arg n "${LABEL_NAME}" --arg c "${LABEL_COLOR}" --arg d "${LABEL_DESCRIPTION}" \
  '{name: $n, color: $c, description: $d}')
LABEL_FILE="${TMP_DIR}/label.json"
status=$(api_retry POST "/repos/${REPO}/labels" "${label_body}" "${LABEL_FILE}")
if [[ "${status}" != "201" && "${status}" != "422" ]]; then
  log "  Warning: could not ensure label (HTTP ${status}); continuing"
fi

# --- 5. Ensure open PR -------------------------------------------------------
SOURCE_URL="https://cdn.jsdelivr.net/gh/deco-cx/apps@${NEW_VERSION}/"
PR_TITLE="chore: bump apps to ${NEW_VERSION}"
PR_BODY=$(cat <<EOF
Automated bump of [deco-cx/apps](https://github.com/deco-cx/apps) to \`${NEW_VERSION}\`.

Updates \`${APP_PATH}\` to:
\`\`\`
${SOURCE_URL}
\`\`\`

[Release notes](https://github.com/deco-cx/apps/releases/tag/${NEW_VERSION})
EOF
)

PR_LIST="${TMP_DIR}/pr-list.json"
status=$(api_retry GET "/repos/${REPO}/pulls?head=${SITE_OWNER}:${BRANCH_NAME}&state=open" "" "${PR_LIST}")
[[ "${status}" == "200" ]] || fail "Failed to list PRs (HTTP ${status})" "${PR_LIST}"

PR_NUMBER=$(jq -r '.[0].number // empty' "${PR_LIST}")
PR_NODE_ID=$(jq -r '.[0].node_id // empty' "${PR_LIST}")

if [[ -n "${PR_NUMBER}" ]]; then
  log "  Updating existing PR #${PR_NUMBER} and converting to draft"
  patch_body=$(jq -n --arg t "${PR_TITLE}" --arg b "${PR_BODY}" '{title: $t, body: $b}')
  PATCH_FILE="${TMP_DIR}/patch.json"
  status=$(api_retry PATCH "/repos/${REPO}/pulls/${PR_NUMBER}" "${patch_body}" "${PATCH_FILE}")
  [[ "${status}" == "200" ]] || fail "Failed to update PR (HTTP ${status})" "${PATCH_FILE}"

  # Ensure label is present on reused PRs too
  add_label_body=$(jq -n --arg l "${LABEL_NAME}" '{labels: [$l]}')
  ADD_LABEL_FILE="${TMP_DIR}/add-label-update.json"
  status=$(api_retry POST "/repos/${REPO}/issues/${PR_NUMBER}/labels" "${add_label_body}" "${ADD_LABEL_FILE}")
  [[ "${status}" == "200" ]] || log "  Warning: could not add label (HTTP ${status})"

  # Convert to draft via GraphQL (using variables to avoid unquoted ID)
  if [[ -n "${PR_NODE_ID}" ]]; then
    DRAFT_FILE="${TMP_DIR}/draft.json"
    draft_query=$(jq -n --arg id "${PR_NODE_ID}" \
      '{query: "mutation ConvertToDraft($id: ID!) { convertPullRequestToDraft(input: {pullRequestId: $id}) { pullRequest { isDraft } } }", variables: {id: $id}}')
    status=$(api_retry POST "/graphql" "${draft_query}" "${DRAFT_FILE}")
    if [[ "${status}" != "200" ]]; then
      log "  Warning: could not convert PR to draft (HTTP ${status})"
    elif jq -e '.errors' "${DRAFT_FILE}" > /dev/null 2>&1; then
      log "  Warning: GraphQL error: $(jq -r '.errors[0].message // "unknown"' "${DRAFT_FILE}")"
    fi
  fi
else
  log "  Opening new draft PR"
  create_pr_body=$(jq -n --arg t "${PR_TITLE}" --arg b "${PR_BODY}" \
    --arg head "${BRANCH_NAME}" --arg base "main" \
    '{title: $t, body: $b, head: $head, base: $base, draft: true}')
  CREATE_PR_FILE="${TMP_DIR}/create-pr.json"
  status=$(api_retry POST "/repos/${REPO}/pulls" "${create_pr_body}" "${CREATE_PR_FILE}")
  [[ "${status}" == "201" ]] || fail "Failed to create PR (HTTP ${status})" "${CREATE_PR_FILE}"
  PR_NUMBER=$(jq -r '.number' "${CREATE_PR_FILE}")
  log "  Opened draft PR #${PR_NUMBER}"

  add_label_body=$(jq -n --arg l "${LABEL_NAME}" '{labels: [$l]}')
  ADD_LABEL_FILE="${TMP_DIR}/add-label.json"
  status=$(api_retry POST "/repos/${REPO}/issues/${PR_NUMBER}/labels" "${add_label_body}" "${ADD_LABEL_FILE}")
  [[ "${status}" == "200" ]] || log "  Warning: could not add label (HTTP ${status})"
fi

log "==> Done (apps@${NEW_VERSION})"
