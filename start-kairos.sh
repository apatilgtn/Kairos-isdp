#!/bin/bash

# KAIROS Application Startup Script
echo "🚀 Starting KAIROS Application..."
echo "=================================="

# Function to check if port is in use
check_port() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to start a service if not running
start_service() {
    local name=$1
    local port=$2
    local directory=$3
    local command=$4
    
    if check_port $port; then
        echo "✅ $name already running on port $port"
    else
        echo "🔄 Starting $name on port $port..."
        cd "$directory"
        $command &
        sleep 2
        if check_port $port; then
            echo "✅ $name started successfully"
        else
            echo "❌ Failed to start $name"
        fi
    fi
}

# Start Auth Backend
start_service "Auth Backend" 4000 "/Users/454469/Documents/GitHub/Kairos-isdp/backend" "node server.js"

# Start LLM Backend  
start_service "LLM Backend" 4001 "/Users/454469/Documents/GitHub/Kairos-isdp/llm-backend" "node server.js"

# Start Frontend
start_service "Frontend" 5173 "/Users/454469/Documents/GitHub/Kairos-isdp" "npm run dev"

echo ""
echo "🎯 Application Status:"
echo "======================"

# Test all services
echo "Auth Backend: $(curl -s http://localhost:4000/api/auth/health >/dev/null && echo '✅ Running' || echo '❌ Down')"
echo "LLM Backend: $(curl -s http://localhost:4001/api/health >/dev/null && echo '✅ Running' || echo '❌ Down')" 
echo "Frontend: $(curl -s http://localhost:5173 >/dev/null && echo '✅ Running' || echo '❌ Down')"

echo ""
echo "🌟 Access your application at: http://localhost:5173"
echo "🔧 LLM Provider: Hugging Face (no installation required)"
echo "📚 Document Types: Business Case, Project Charter, Roadmap, Feasibility Study"
