#! /bin/bash

echo "Running pre-release commands" 

echo "Checking if there are any changes in the current branch"

if ! git diff --exit-code; then
  echo "There are changes in the current branch"
  exit 1
fi

echo "Checking if there are any changes in the main branch"
if ! git diff --exit-code origin/main; then
  echo "There are changes in the main branch"
  exit 1
fi

npx nx release plan --base=origin/main --head=HEAD --only-touched=false