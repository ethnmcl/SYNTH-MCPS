#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   source scripts/export-supabase-env.sh <SUPABASE_ACCESS_TOKEN> <SUPABASE_PROJECT_REF> [--persist]
#   source scripts/export-supabase-env.sh --prompt [--persist]

persist="false"
prompt="false"

for arg in "$@"; do
  case "$arg" in
    --persist) persist="true" ;;
    --prompt) prompt="true" ;;
  esac
done

access_token="${SUPABASE_ACCESS_TOKEN:-}"
project_ref="${SUPABASE_PROJECT_REF:-}"

if [[ "$prompt" == "true" ]]; then
  read -r -s -p "Enter SUPABASE_ACCESS_TOKEN: " access_token
  printf "\n"
  read -r -p "Enter SUPABASE_PROJECT_REF: " project_ref
elif [[ ${#} -ge 2 ]]; then
  access_token="$1"
  project_ref="$2"
fi

if [[ -z "$access_token" || -z "$project_ref" ]]; then
  echo "Usage: source scripts/export-supabase-env.sh <SUPABASE_ACCESS_TOKEN> <SUPABASE_PROJECT_REF> [--persist]"
  echo "   or: source scripts/export-supabase-env.sh --prompt [--persist]"
  return 1 2>/dev/null || exit 1
fi

export SUPABASE_ACCESS_TOKEN="$access_token"
export SUPABASE_PROJECT_REF="$project_ref"

mask_token() {
  local raw="$1"
  if [[ ${#raw} -lt 10 ]]; then
    echo "[REDACTED]"
  else
    echo "${raw:0:6}...${raw: -4}"
  fi
}

echo "Exported SUPABASE_ACCESS_TOKEN=$(mask_token "$SUPABASE_ACCESS_TOKEN")"
echo "Exported SUPABASE_PROJECT_REF=$SUPABASE_PROJECT_REF"

if [[ "$persist" == "true" ]]; then
  env_file=".env"
  touch "$env_file"

  if grep -q '^SUPABASE_ACCESS_TOKEN=' "$env_file"; then
    sed -i.bak "s#^SUPABASE_ACCESS_TOKEN=.*#SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN#" "$env_file"
  else
    printf '\nSUPABASE_ACCESS_TOKEN=%s\n' "$SUPABASE_ACCESS_TOKEN" >> "$env_file"
  fi

  if grep -q '^SUPABASE_PROJECT_REF=' "$env_file"; then
    sed -i.bak "s#^SUPABASE_PROJECT_REF=.*#SUPABASE_PROJECT_REF=$SUPABASE_PROJECT_REF#" "$env_file"
  else
    printf 'SUPABASE_PROJECT_REF=%s\n' "$SUPABASE_PROJECT_REF" >> "$env_file"
  fi

  rm -f "$env_file.bak"
  echo "Updated $env_file with SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF"
fi
