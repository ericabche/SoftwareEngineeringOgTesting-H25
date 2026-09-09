#!/bin/bash

# Setup script for Git hooks
# Installs pre-commit hook for testing

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[SETUP]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Get the repository root directory
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

log "Setting up Git hooks for Buss-App Østfold..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "Error: Not in a git repository!"
    echo "Please run this script from the root of your git repository."
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Make pre-commit script executable
chmod +x scripts/pre-commit.sh

# Create the pre-commit hook
log "Creating pre-commit hook..."
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook for Buss-App Østfold
# This hook runs tests before allowing commits

# Get the repository root directory
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Run the pre-commit script
exec "$REPO_ROOT/scripts/pre-commit.sh"
EOF

# Make the hook executable
chmod +x .git/hooks/pre-commit

log "Pre-commit hook installed successfully!"

# Test the hook
log "Testing the pre-commit hook..."
if .git/hooks/pre-commit; then
    log "Pre-commit hook test passed!"
else
    warning "Pre-commit hook test failed, but hook is installed."
    warning "This might be normal if there are no staged changes."
fi

echo ""
log "Setup completed! 🎉"
echo ""
echo "The pre-commit hook will now run tests before every commit."
echo ""
echo "What happens when you commit:"
echo "1. If you changed Frontend files → runs npm test and npm run build"
echo "2. If you changed Backend files → runs mvn test and mvn compile"
echo "3. If tests fail → commit is blocked"
echo "4. If tests pass → commit proceeds"
echo ""
echo "To bypass the hook (not recommended):"
echo "  git commit --no-verify -m 'your message'"
echo ""
echo "To run tests manually:"
echo "  ./scripts/pre-commit.sh"
