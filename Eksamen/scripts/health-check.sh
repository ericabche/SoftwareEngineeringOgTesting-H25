#!/bin/bash

FRONTEND_URL="https://itstud.hiof.no/~philipag/app/"
BACKEND_URL="http://localhost:8080"
BACKEND_JAR="$HOME/apps/backend/bussapp-backend.jar"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

check_frontend() {
    log "Checking frontend..."
    
    if curl -s -f "$FRONTEND_URL" >/dev/null 2>&1; then
        log "Frontend: OK"
        return 0
    else
        log "Frontend: FAILED"
        return 1
    fi
}

check_backend() {
    log "Checking backend..."
    
    if [ ! -f "$BACKEND_JAR" ]; then
        log "Backend jar not found"
        return 1
    fi
    
    if [ -f "$HOME/logs/backend.pid" ]; then
        PID=$(cat "$HOME/logs/backend.pid")
        if ! kill -0 "$PID" 2>/dev/null; then
            log "Backend process not running"
            return 1
        fi
    else
        log "Backend not running"
        return 1
    fi
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/" 2>/dev/null)
    
    if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
        log "Backend: OK (HTTP $HTTP_CODE)"
        return 0
    else
        log "Backend: FAILED"
        return 1
    fi
}

check_all() {
    FRONTEND_OK=false
    BACKEND_OK=false
    
    if check_frontend; then
        FRONTEND_OK=true
    fi
    
    if check_backend; then
        BACKEND_OK=true
    fi
    
    if [ "$FRONTEND_OK" = true ] && [ "$BACKEND_OK" = true ]; then
        log "All services: OK"
        exit 0
    else
        log "Some services failed"
        exit 1
    fi
}

case "${1:-all}" in
    frontend) check_frontend ;;
    backend) check_backend ;;
    all) check_all ;;
    *) echo "Usage: $0 [frontend|backend|all]"; exit 1 ;;
esac
