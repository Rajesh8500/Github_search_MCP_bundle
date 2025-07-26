# Quick Start Script for GitHub Search MCP
# Use this if you already have Node.js and Git installed

param(
    [switch]$SkipBrowser
)

Write-Host "🚀 GitHub Search MCP - Quick Start" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js not found. Please run 'start.bat' instead." -ForegroundColor Red
    exit 1
}

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Are you in the right directory?" -ForegroundColor Red
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating environment file..." -ForegroundColor Yellow
    
    Write-Host "`n[TOKEN] GitHub Token Setup:" -ForegroundColor Cyan
    Write-Host "Get your token from: https://github.com/settings/tokens" -ForegroundColor Gray
    $token = Read-Host "Enter your GitHub Personal Access Token (or press Enter to skip)"
    
    if (-not $token) {
        $token = "your_github_personal_access_token_here"
    }
    
    @"
GITHUB_TOKEN=$token
PORT=3000
"@ | Out-File -FilePath ".env" -Encoding ASCII
}

Write-Host "`n🚀 Starting server..." -ForegroundColor Green

# Start server and open browser
Start-Process powershell -ArgumentList "-Command", "npm start" -WindowStyle Minimized

# Wait for server to start
Start-Sleep -Seconds 3

# Open browser
if (-not $SkipBrowser) {
    Write-Host "🌐 Opening browser..." -ForegroundColor Green
    Start-Process "http://localhost:3000"
}

Write-Host "`n✅ GitHub Search MCP is running!" -ForegroundColor Green
Write-Host "🌐 URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "⏹️  Close the npm start window to stop the server" -ForegroundColor Yellow 