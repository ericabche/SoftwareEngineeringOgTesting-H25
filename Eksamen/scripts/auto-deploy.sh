#!/bin/bash

REPO_DIR="$HOME/crispy-bassoon-ostfold"
LAST_COMMIT_FILE="$HOME/logs/last-commit.txt"
LOG_FILE="$HOME/logs/auto-deploy.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

cd "$REPO_DIR"
git fetch origin main >/dev/null 2>&1
REMOTE_COMMIT=$(git rev-parse origin/main)

if [ -f "$LAST_COMMIT_FILE" ]; then
    LOCAL_COMMIT=$(cat "$LAST_COMMIT_FILE")
else
    LOCAL_COMMIT=""
fi

if [ "$REMOTE_COMMIT" != "$LOCAL_COMMIT" ]; then
    log "New commit detected: $REMOTE_COMMIT"
    log "Starting deployment..."
    
    if ~/bin/deploy.sh >> "$LOG_FILE" 2>&1; then
        echo "$REMOTE_COMMIT" > "$LAST_COMMIT_FILE"
        log "deployment successful"
    else
        log "deployment failed"
    fi
else
    log "No new commits, already at $REMOTE_COMMIT"
fi
