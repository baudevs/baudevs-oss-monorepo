#! /bin/bash

echo "Running pre-release commands" 

echo "Checking if there are uncommitted changes"

if ! git diff --exit-code; then
  echo "There are uncommitted changes"
  echo "Do you want to add and commit automatically? (y/n)"
  read -r answer
  if [ "$answer" = "y" ]; then
    git add .
    git commit -m "chore: automated commit before release"
  else
    exit 1
  fi
fi

npx nx release plan --base=origin/main --head=HEAD --only-touched=false
