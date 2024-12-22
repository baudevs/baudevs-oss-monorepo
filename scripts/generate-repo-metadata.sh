#!/usr/bin/env bash
set -euo pipefail

# This script:
# 1. Reads Git + Nx info from the current repository.
# 2. Outputs a single JSON file "repoMetadata.json".

OUTPUT_FILE="repoMetadata.json"
tmpfile=$(mktemp)

# Basic Repo Info
repoPath="$(pwd)"
defaultBranch="$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo 'NOT SET')"

echo '{}' | jq --arg repoPath "$repoPath" \
               --arg defBranch "$defaultBranch" \
               --arg genTime "$(date '+%Y-%m-%d %H:%M:%S')" \
               '. + {
                  "repoPath": $repoPath,
                  "defaultBranch": $defBranch,
                  "generatedAt": $genTime
               }' > "$tmpfile"

# Nx projects (from "nx show projects --json")
nx_projects_json='[]'
if [ -f "nx.json" ]; then
  if npx nx show projects --json &>/dev/null; then
    nx_projects_json="$(npx nx show projects --json)"
  fi
fi

# Merge Nx projects array
jq --argjson nxp "$nx_projects_json" '. + { "nxProjects": $nxp }' "$tmpfile" > "$tmpfile.new"
mv "$tmpfile.new" "$tmpfile"

# All local branches
allBranches=()
while IFS= read -r b; do
  allBranches+=("$b")
done < <(git for-each-ref --format='%(refname:short)' refs/heads)

# Branch relationships (merges/rebases)
rels='[]'
for b1 in "${allBranches[@]}"; do
  for b2 in "${allBranches[@]}"; do
    if [ "$b1" != "$b2" ]; then
      # Check merges (if b1 is ancestor of b2)
      if git merge-base --is-ancestor "$b1" "$b2" 2>/dev/null; then
        rels=$(echo "$rels" | jq --arg f "$b1" --arg t "$b2" --arg type "merge" \
          '. + [{ "from": $f, "to": $t, "type": $type }]')
      fi
      # Check rebases
      b1_head=$(git rev-parse "$b1" 2>/dev/null || echo "")
      if [ -n "$b1_head" ]; then
        if git log "$b2" --not "$b1" --oneline 2>/dev/null | grep -q "$b1_head"; then
          rels=$(echo "$rels" | jq --arg f "$b1" --arg t "$b2" --arg type "rebase" \
            '. + [{ "from": $f, "to": $t, "type": $type }]')
        fi
      fi
    fi
  done
done

jq --argjson r "$rels" '. + { "branchRelationships": $r }' "$tmpfile" > "$tmpfile.new"
mv "$tmpfile.new" "$tmpfile"

# Final output, pretty-print
mv "$tmpfile" "$OUTPUT_FILE"
jq . "$OUTPUT_FILE" > "$OUTPUT_FILE.pretty" && mv "$OUTPUT_FILE.pretty" "$OUTPUT_FILE"

echo "✅ Generated $OUTPUT_FILE successfully!"