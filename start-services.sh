#!/bin/bash

echo "🚀 Starting Kairos services for demo..."

# Kill any existing processes
echo "Stopping existing services..."
lsof -ti :4000,4001,5173,8888 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 2

# Start local Python LLM service
echo "Starting local Python LLM service (port 8888)..."
cd /Users/454469/Documents/GitHub/Kairos-isdp/llm-backend
python3 local_llm_service.py --server &
PYTHON_LLM_PID=$!

# Start auth backend
echo "Starting auth backend (port 4000)..."
cd /Users/454469/Documents/GitHub/Kairos-isdp/backend
node server.js &
AUTH_PID=$!

# Start LLM backend  
echo "Starting LLM backend (port 4001)..."
cd /Users/454469/Documents/GitHub/Kairos-isdp/llm-backend
node server.js &
LLM_PID=$!

# Start frontend
echo "Starting frontend (port 5173)..."
cd /Users/454469/Documents/GitHub/Kairos-isdp
npm run dev &
FRONTEND_PID=$!

# Wait a moment for services to start
sleep 5

echo "✅ All services started!"
echo "🔗 Access your app at: http://localhost:5173/"
echo "🔑 Login with: admin / password"
echo ""
echo "Service PIDs:"
echo "- Python LLM: $PYTHON_LLM_PID"
echo "- Auth Backend: $AUTH_PID"
echo "- LLM Backend: $LLM_PID" 
echo "- Frontend: $FRONTEND_PID"
echo ""
echo "To stop all services: kill $PYTHON_LLM_PID $AUTH_PID $LLM_PID $FRONTEND_PID"

# Keep script running
wait
