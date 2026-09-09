#!/bin/bash

set -e  # Exit on any error

# Configuration  
REPO_DIR="$HOME/crispy-bassoon-ostfold"
WEB_DIR="$HOME/htdocs/app"
BACKEND_DIR="$HOME/apps/backend"
LOG_FILE="$HOME/logs/deploy.log"
PID_FILE="$HOME/logs/backend.pid"

# Ensure directories exist
mkdir -p "$HOME/logs" "$HOME/apps/backend" "$HOME/htdocs/app"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log "Starting deployment..."

# Clone or pull repository using SSH
if [ ! -d "$REPO_DIR" ]; then
    log "Cloning repository via SSH..."
    cd "$HOME"
    git clone git@github.com:craftpag/crispy-bassoon-ostfold.git
else
    log "Pulling latest changes..."
    cd "$REPO_DIR"
    git remote set-url origin git@github.com:craftpag/crispy-bassoon-ostfold.git
    git fetch origin main
    git reset --hard origin/main
    git pull origin main
fi

cd "$REPO_DIR"
COMMIT_HASH=$(git rev-parse --short HEAD)
log "Deploying commit: $COMMIT_HASH"

# Build Frontend
log "Building frontend..."
cd "$REPO_DIR/Frontend"

# Ensure we're using the local Node.js
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verify vite.config.ts has the correct base path
if ! grep -q "base: './'," vite.config.ts; then
    log "WARNING: vite.config.ts may not have correct base path for deployment"
    log "Expected: base: './'"
fi

log "Installing npm deps..."
npm install

log "Running frontend tests..."
if ! npm test -- --watchAll=false --passWithNoTests; then
    log "Frontend tests failed!"
    exit 1
fi

log "Building React app..."
if [ -n "$FRONTEND_API_BASE" ]; then
    log "Using FRONTEND_API_BASE=$FRONTEND_API_BASE"
    export VITE_API_BASE="$FRONTEND_API_BASE"
    if ! VITE_API_BASE="$FRONTEND_API_BASE" npm run build; then
        log "Frontend build failed!"
        exit 1
    fi
else
    if ! npm run build; then
        log "Frontend build failed!"
        exit 1
    fi
fi

# Verify frontend build
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    log "Frontend build verification failed - no dist directory or index.html"
    exit 1
fi

log "Frontend build verified successfully"

# Copy frontend build to web directory
log "Copying frontend to web directory..."
rm -rf "$WEB_DIR"/*
cp -r dist/* "$WEB_DIR/"

# Create index.html redirect if needed
if [ ! -f "$HOME/htdocs/index.html" ] || ! grep -q "Buss-App Østfold" "$HOME/htdocs/index.html"; then
    log "Creating root index.html redirect..."
    cat > "$HOME/htdocs/index.html" << 'HTML_EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Buss-App Østfold</title>
    <meta http-equiv="refresh" content="0; url=./app/">
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        a { color: #646cff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Buss-App Østfold</h1>
        <p>Redirecting to <a href="./app/">the application</a>...</p>
        <p><small>If you are not redirected automatically, click the link above.</small></p>
    </div>
</body>
</html>
HTML_EOF
fi

# Set proper permissions
chmod 755 "$HOME/htdocs" "$WEB_DIR"
find "$WEB_DIR" -type f -exec chmod 644 {} \;
find "$WEB_DIR" -type d -exec chmod 755 {} \;
chmod 644 "$HOME/htdocs/index.html"

log "Frontend deployed successfully!"
log "Frontend URL: https://itstud.hiof.no/~philipag/app/"

# Build Backend
log "Building backend..."
cd "$REPO_DIR/Backend"

# Check if Maven wrapper exists
if [ -f "./mvnw" ]; then
    MVN_CMD="./mvnw"
elif command -v mvn >/dev/null 2>&1; then
    MVN_CMD="mvn"
else
    log "Maven not found and no wrapper available. Skipping backend build."
    MVN_CMD=""
fi

if [ -n "$MVN_CMD" ]; then
    log "Running backend tests..."
    if ! $MVN_CMD test; then
        log "Backend tests failed!"
        exit 1
    fi
    
    log "Compiling backend..."
    if ! $MVN_CMD clean compile package -DskipTests; then
        log "Backend compilation failed!"
        exit 1
    fi
    
    # Verify backend build
    JAR_FILE=$(find target -name "*.jar" -not -name "*sources.jar" -not -name "*javadoc.jar" | head -1)
    if [ -z "$JAR_FILE" ] || [ ! -f "$JAR_FILE" ]; then
        log "Backend build verification failed - no jar file found"
        exit 1
    fi
    
    log "Backend build verified successfully"
    
    # Copy backend jar to deployment directory
    log "Copying backend jar..."
    cp "$JAR_FILE" "$BACKEND_DIR/bussapp-backend.jar"
    
    # Restart backend service
    log "Restarting backend service..."
    if [ -f "$HOME/bin/manage-services.sh" ]; then
        ~/bin/manage-services.sh restart
    else
        log "Service manager not found, backend jar copied but not started"
    fi
else
    log "Backend build skipped - Maven not available"
fi

# Health checks
log "Running health checks..."

# Check frontend accessibility
log "Checking frontend health..."
if curl -s -f "https://itstud.hiof.no/~philipag/app/" >/dev/null 2>&1; then
    log "Frontend health check passed"
else
    log "Frontend health check failed - site not accessible"
    exit 1
fi

# Check backend health (if running)
if [ -f "$BACKEND_DIR/bussapp-backend.jar" ]; then
    log "Checking backend health..."
    sleep 5  # Give backend time to start
    
    if curl -s -f "http://localhost:8080/actuator/health" >/dev/null 2>&1; then
        log "Backend health check passed"
    elif curl -s -f "http://localhost:8080/api/health" >/dev/null 2>&1; then
        log "Backend health check passed (alternative endpoint)"
    else
        log "Backend health check failed - service not responding"
        log "Backend may still be starting up or health endpoint not available"
    fi
fi

log "Deployment completed successfully!"
log "Frontend: https://itstud.hiof.no/~philipag/app/"
log "Backend: http://localhost:8080 (if running)"
