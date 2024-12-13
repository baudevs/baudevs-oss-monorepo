#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# GitHub repo details
GITHUB_REPO="baudevs/baudevs-oss-monorepo"
GITHUB_ISSUES_URL="https://github.com/${GITHUB_REPO}/issues/new"

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to prompt user
prompt_user() {
    local message=$1
    local response
    print_message "$YELLOW" "$message (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to handle errors and optionally create bug report
handle_error() {
    local error_message=$1
    local error_context=$2
    local affected_library=$3
    local error_output=$4

    print_message "$RED" "❌ Error: $error_message"
    
    if prompt_user "Would you like to report this as a bug?"; then
        # URL encode the error message and context
        encoded_title=$(echo "[BUG]: $error_message" | sed 's/ /%20/g')
        encoded_body=$(echo -e "## Describe the bug\n\n$error_context\n\n## To Reproduce\n\n1. Running pre-release script\n2. Error occurred during: $error_message\n3. Error output shown below\n\n## Error Output\n\`\`\`\n$error_output\n\`\`\`\n\n## Expected behavior\n\nThe command should complete successfully without errors.\n\n## Environment\n\n- Version of $affected_library: $(npm list $affected_library 2>/dev/null | grep $affected_library || echo "unknown")\n- Node.js version: $(node -v)\n- OS: $(uname -s)\n\n## Additional context\n\nThis error occurred during the pre-release script execution." | sed 's/ /%20/g' | sed 's/\n/%0A/g')
        encoded_labels="bug,${affected_library}"
        
        bug_url="${GITHUB_ISSUES_URL}?title=${encoded_title}&body=${encoded_body}&labels=${encoded_labels}"
        
        if command_exists "open"; then
            open "$bug_url"
        elif command_exists "xdg-open"; then
            xdg-open "$bug_url"
        elif command_exists "start"; then
            start "$bug_url"
        else
            print_message "$YELLOW" "Please open this URL in your browser to create the bug report:"
            echo "$bug_url"
        fi
        
        print_message "$BLUE" "🔗 Opening GitHub issues page..."
    fi
    
    exit 1
}

# Check for required commands
for cmd in git npx; do
    if ! command_exists "$cmd"; then
        handle_error "$cmd is not installed" "Required command not found" "infrastructure"
    fi
done

print_message "$BLUE" "🚀 Starting pre-release checks..."

# Check and fetch remote changes first
print_message "$BLUE" "🔄 Checking for remote changes..."
if ! git fetch origin main --quiet; then
    handle_error "Failed to fetch from remote" "Git fetch command failed" "infrastructure"
fi

# Check if we need to pull changes
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})

if [ $LOCAL = $REMOTE ]; then
    print_message "$GREEN" "✅ Already up to date with remote"
elif [ $LOCAL = $BASE ]; then
    print_message "$YELLOW" "⚠️  Local branch is behind remote."
    
    # Check for uncommitted changes before pulling
    if ! git diff --quiet --exit-code || ! git diff --cached --quiet --exit-code; then
        print_message "$YELLOW" "⚠️  You have uncommitted changes that need to be handled before pulling"
        
        if prompt_user "Do you want to stash your changes before pulling?"; then
            if ! git stash push -m "pre-release-script: auto-stash"; then
                handle_error "Failed to stash changes" "Git stash command failed" "infrastructure" "$(git status)"
            fi
            print_message "$GREEN" "✅ Changes stashed successfully"
            
            if ! git pull origin main --quiet; then
                handle_error "Failed to pull changes" "Git pull command failed" "infrastructure" "$(git status)"
            fi
            
            if ! git stash pop; then
                handle_error "Failed to pop stashed changes" "Git stash pop failed - you may need to resolve conflicts manually" "infrastructure" "$(git status)"
            fi
            print_message "$GREEN" "✅ Changes reapplied successfully"
        else
            print_message "$YELLOW" "⚠️  Please commit or stash your changes manually before running this script"
            exit 1
        fi
    else
        print_message "$BLUE" "🔄 Pulling changes..."
        if ! git pull origin main --quiet; then
            handle_error "Failed to pull changes" "Git pull command failed" "infrastructure" "$(git status)"
        fi
        print_message "$GREEN" "✅ Successfully pulled remote changes"
    fi
fi

# Check for uncommitted changes
print_message "$BLUE" "📝 Checking for uncommitted changes..."
if ! git diff --quiet --exit-code || ! git diff --cached --quiet --exit-code; then
    print_message "$YELLOW" "⚠️  Uncommitted changes detected!"
    
    if prompt_user "Do you want to add and commit these changes?"; then
        if ! git add .; then
            handle_error "Failed to stage changes" "Git add command failed" "infrastructure"
        fi
        if ! git commit -m "chore: automated commit before release"; then
            handle_error "Failed to commit changes" "Git commit command failed" "infrastructure"
        fi
        print_message "$GREEN" "✅ Changes committed successfully"
    else
        print_message "$YELLOW" "⚠️  Aborting: Please commit your changes manually"
        exit 1
    fi
fi

# Run NX release plan
print_message "$BLUE" "📋 Generating release plan..."
if ! npx nx release plan --base=origin/main --head=HEAD --only-touched=false; then
    # Try to determine affected library from error output
    affected_library=$(npx nx show projects --affected --base=origin/main --head=HEAD 2>/dev/null | head -n 1 || echo "unknown")
    handle_error "Failed to generate release plan" "NX release plan command failed" "$affected_library"
fi

if prompt_user "📦 Do you want to commit the release plan?"; then
    if ! git add .; then
        handle_error "Failed to stage release plan" "Git add command failed" "infrastructure"
    fi
    if ! git commit -m "chore: automated commit of release plan"; then
        handle_error "Failed to commit release plan" "Git commit command failed" "infrastructure"
    fi
    print_message "$GREEN" "✅ Release plan committed successfully"
else
    print_message "$YELLOW" "⚠️  Release plan not committed"
fi

print_message "$GREEN" "✨ Pre-release checks completed successfully!"

print_message "$GREEN" "🎉 All checks passed! Ready to push!"