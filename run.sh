#!/bin/bash

# GitHub Search MCP - Cross-platform startup script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🚀 GitHub Search MCP - Auto Setup${NC}"
echo -e "${PURPLE}====================================${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
echo -e "${BLUE}🔍 Checking Node.js...${NC}"
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js $NODE_VERSION found${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    echo -e "${YELLOW}Please install Node.js 18.0.0 or higher from: https://nodejs.org${NC}"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm $NPM_VERSION found${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Check Git (optional)
echo -e "${BLUE}🔍 Checking Git...${NC}"
if command_exists git; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✅ $GIT_VERSION found${NC}"
else
    echo -e "${YELLOW}⚠️  Git not found (optional)${NC}"
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Setup environment
echo -e "${BLUE}🔧 Setting up environment...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${CYAN}🔑 GitHub Personal Access Token Setup:${NC}"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Select 'public_repo' or 'repo' scope"
    echo "4. Copy the generated token"
    echo
    read -p "Enter your GitHub Personal Access Token (or press Enter to skip): " TOKEN
    
    if [ -z "$TOKEN" ]; then
        TOKEN="your_github_personal_access_token_here"
        echo -e "${YELLOW}⚠️  You can add your token later in the .env file${NC}"
    fi
    
    cat > .env << EOF
GITHUB_TOKEN=$TOKEN
PORT=3000
EOF
    echo -e "${GREEN}✅ Environment file created${NC}"
else
    echo -e "${GREEN}✅ Environment file already exists${NC}"
fi

# Start the application
echo -e "${BLUE}🚀 Starting GitHub Search MCP...${NC}"

# Check if we should skip browser opening
SKIP_BROWSER=false
for arg in "$@"; do
    if [ "$arg" = "--skip-browser" ]; then
        SKIP_BROWSER=true
    fi
done

# Start server in background
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Server started successfully!${NC}"
    echo -e "${CYAN}🌐 Web Interface: http://localhost:3000${NC}"
    
    # Open browser if not skipped
    if [ "$SKIP_BROWSER" = false ]; then
        echo -e "${BLUE}🌐 Opening browser...${NC}"
        if command_exists xdg-open; then
            xdg-open http://localhost:3000 >/dev/null 2>&1 &
        elif command_exists open; then
            open http://localhost:3000 >/dev/null 2>&1 &
        else
            echo -e "${YELLOW}⚠️  Could not open browser automatically${NC}"
            echo -e "${CYAN}   Please open: http://localhost:3000${NC}"
        fi
    fi
    
    echo -e "${GREEN}🎉 GitHub Search MCP is now running!${NC}"
    echo -e "${YELLOW}⏸️  Press Ctrl+C to stop the server${NC}"
    
    # Wait for Ctrl+C
    trap "echo -e '\n${YELLOW}🛑 Stopping server...${NC}'; kill $SERVER_PID; exit 0" INT
    wait $SERVER_PID
else
    echo -e "${RED}❌ Failed to start server${NC}"
    exit 1
fi 