#!/bin/bash

# Pre-commit hook script for Buss-App Østfold
# Runs tests before allowing commits

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[PRE-COMMIT]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Get the repository root directory
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

log "Running pre-commit tests..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    error "Not in a git repository!"
    exit 1
fi

# Check for staged changes
if [ -z "$(git diff --cached --name-only)" ]; then
    warning "No staged changes found. Nothing to test."
    exit 0
fi

# Check if frontend or backend files are staged
FRONTEND_FILES=$(git diff --cached --name-only | grep -E '^Frontend/' || true)
BACKEND_FILES=$(git diff --cached --name-only | grep -E '^Backend/' || true)

# Run frontend tests if frontend files are staged
if [ -n "$FRONTEND_FILES" ]; then
    log "Frontend files changed, running frontend tests..."
    
    if [ ! -d "Frontend" ]; then
        error "Frontend directory not found!"
        exit 1
    fi
    
    cd Frontend
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        error "package.json not found in Frontend directory!"
        exit 1
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        log "Installing frontend dependencies..."
        npm install
    fi
    
    # Run frontend tests
    log "Running frontend tests..."
    if ! npm test -- --watchAll=false --passWithNoTests; then
        error "Frontend tests failed!"
        exit 1
    fi
    
    # Run frontend build to ensure it compiles
    log "Building frontend..."
    if ! npm run build; then
        error "Frontend build failed!"
        exit 1
    fi
    
    log "Frontend tests and build passed!"
    cd "$REPO_ROOT"
fi

# Run backend tests if backend files are staged
if [ -n "$BACKEND_FILES" ]; then
    log "Backend files changed, running backend tests..."
    
    if [ ! -d "Backend" ]; then
        error "Backend directory not found!"
        exit 1
    fi
    
    cd Backend
    
    # Check if pom.xml exists
    if [ ! -f "pom.xml" ]; then
        error "pom.xml not found in Backend directory!"
        exit 1
    fi
    
    # Check for Maven wrapper or Maven command
    if [ -f "./mvnw" ]; then
        MVN_CMD="./mvnw"
    elif command -v mvn >/dev/null 2>&1; then
        MVN_CMD="mvn"
    else
        error "Maven not found and no wrapper available!"
        exit 1
    fi
    
    # Run backend tests
    log "Running backend tests..."
    if ! $MVN_CMD test; then
        error "Backend tests failed!"
        exit 1
    fi
    
    # Run backend compilation
    log "Compiling backend..."
    if ! $MVN_CMD compile; then
        error "Backend compilation failed!"
        exit 1
    fi
    
    log "Backend tests and compilation passed!"
    cd "$REPO_ROOT"
fi

# If no frontend or backend files changed, just run a quick check
if [ -z "$FRONTEND_FILES" ] && [ -z "$BACKEND_FILES" ]; then
    log "No frontend or backend files changed, skipping tests."
    log "Pre-commit check completed successfully!"
    exit 0
fi

log "All pre-commit tests passed! ✅"
log "You can now commit your changes."
