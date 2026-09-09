#!/bin/bash

# Process management script
BACKEND_PID_FILE="$HOME/logs/backend.pid"

start_backend() {
    if [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null; then
        echo "Backend already running (PID: $(cat "$BACKEND_PID_FILE"))"
    else
        if [ -f "$HOME/apps/backend/bussapp-backend.jar" ]; then
            echo "Starting backend..."
            cd "$HOME/apps/backend"
            nohup java -jar bussapp-backend.jar --server.port=8080 > "$HOME/logs/backend.log" 2>&1 &
            echo $! > "$BACKEND_PID_FILE"
            echo "Backend started (PID: $(cat "$BACKEND_PID_FILE"))"
        else
            echo "Backend jar not found. Run deployment first."
        fi
    fi
}

stop_backend() {
    if [ -f "$BACKEND_PID_FILE" ]; then
        PID=$(cat "$BACKEND_PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID"
            rm -f "$BACKEND_PID_FILE"
            echo "Backend stopped"
        else
            echo "Backend not running"
            rm -f "$BACKEND_PID_FILE"
        fi
    else
        echo "Backend not running"
    fi
}

status() {
    echo "=== Service Status ==="
    
    if [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null; then
        echo "Backend: Running (PID: $(cat "$BACKEND_PID_FILE"))"
        echo "Backend port check:"
        netstat -tlnp 2>/dev/null | grep ":8080" | grep "$(cat "$BACKEND_PID_FILE")" || echo "  Not listening on 8080"
    else
        echo "Backend: Stopped"
    fi
    
    echo ""
    echo "=== Log Files ==="
    echo "Deployment log: $HOME/logs/deploy.log"
    echo "Backend log: $HOME/logs/backend.log"
    
    if [ -f "$HOME/logs/backend.log" ]; then
        echo ""
        echo "=== Recent Backend Log (last 10 lines) ==="
        tail -10 "$HOME/logs/backend.log"
    fi
}

logs() {
    echo "=== Following Backend Logs ==="
    echo "Press Ctrl+C to stop"
    tail -f "$HOME/logs/backend.log"
}

case "$1" in
    start)
        start_backend
        ;;
    stop)
        stop_backend
        ;;
    restart)
        stop_backend
        sleep 2
        start_backend
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the backend service"
        echo "  stop    - Stop the backend service"
        echo "  restart - Restart the backend service"
        echo "  status  - Show service status and recent logs"
        echo "  logs    - Follow backend logs in real-time"
        exit 1
        ;;
esac
