# GitHub Search MCP - Complete Setup Bundle
# This script will automatically install all prerequisites and start the application

param(
    [switch]$SkipBrowser,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colors for output
$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Write-Header {
    param([string]$Message)
    Write-Host "`n" -NoNewline
    Write-ColorOutput "=" * 60 -Color "Header"
    Write-ColorOutput " $Message " -Color "Header"
    Write-ColorOutput "=" * 60 -Color "Header"
}

function Test-AdminRights {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Install-Chocolatey {
    Write-ColorOutput "[INSTALL] Installing Chocolatey package manager..." -Color "Info"
    try {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        refreshenv
        Write-ColorOutput "[SUCCESS] Chocolatey installed successfully!" -Color "Success"
        return $true
    }
    catch {
        Write-ColorOutput "[ERROR] Failed to install Chocolatey: $($_.Exception.Message)" -Color "Error"
        return $false
    }
}

function Test-NodeJS {
    Write-ColorOutput "[CHECK] Checking Node.js installation..." -Color "Info"
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            $versionNumber = [Version]($nodeVersion -replace 'v', '')
            if ($versionNumber -ge [Version]"18.0.0") {
                Write-ColorOutput "[SUCCESS] Node.js $nodeVersion is installed and compatible" -Color "Success"
                return $true
            }
            else {
                Write-ColorOutput "[WARNING] Node.js $nodeVersion is too old (need 18.0.0+)" -Color "Warning"
                return $false
            }
        }
    }
    catch {
        Write-ColorOutput "[WARNING] Node.js not found" -Color "Warning"
        return $false
    }
    return $false
}

function Install-NodeJS {
    Write-ColorOutput "[INSTALL] Installing Node.js..." -Color "Info"
    try {
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            choco install nodejs -y
        }
        else {
            # Download and install Node.js directly
            $nodeUrl = "https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi"
            $tempFile = "$env:TEMP\nodejs-installer.msi"
            
            Write-ColorOutput "[DOWNLOAD] Downloading Node.js..." -Color "Info"
            Invoke-WebRequest -Uri $nodeUrl -OutFile $tempFile
            
            Write-ColorOutput "[INSTALL] Installing Node.js..." -Color "Info"
            Start-Process msiexec.exe -Wait -ArgumentList "/i `"$tempFile`" /quiet /norestart"
            Remove-Item $tempFile -Force
        }
        
        # Refresh environment
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Write-ColorOutput "[SUCCESS] Node.js installed successfully!" -Color "Success"
        return $true
    }
    catch {
        Write-ColorOutput "[ERROR] Failed to install Node.js: $($_.Exception.Message)" -Color "Error"
        return $false
    }
}

function Test-Git {
    Write-ColorOutput "[CHECK] Checking Git installation..." -Color "Info"
    try {
        $gitVersion = git --version 2>$null
        if ($gitVersion) {
            Write-ColorOutput "[SUCCESS] $gitVersion is installed" -Color "Success"
            return $true
        }
    }
    catch {
        Write-ColorOutput "[WARNING] Git not found" -Color "Warning"
        return $false
    }
    return $false
}

function Install-Git {
    Write-ColorOutput "[INSTALL] Installing Git..." -Color "Info"
    try {
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            choco install git -y
        }
        else {
            # Download and install Git directly
            $gitUrl = "https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.2/Git-2.42.0.2-64-bit.exe"
            $tempFile = "$env:TEMP\git-installer.exe"
            
            Write-ColorOutput "[DOWNLOAD] Downloading Git..." -Color "Info"
            Invoke-WebRequest -Uri $gitUrl -OutFile $tempFile
            
            Write-ColorOutput "[INSTALL] Installing Git..." -Color "Info"
            Start-Process $tempFile -Wait -ArgumentList "/VERYSILENT /NORESTART"
            Remove-Item $tempFile -Force
        }
        
        # Refresh environment
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Write-ColorOutput "[SUCCESS] Git installed successfully!" -Color "Success"
        return $true
    }
    catch {
        Write-ColorOutput "[ERROR] Failed to install Git: $($_.Exception.Message)" -Color "Error"
        return $false
    }
}

function Setup-Environment {
    Write-ColorOutput "[SETUP] Setting up environment..." -Color "Info"
    
    # Create .env file if it doesn't exist
    if (-not (Test-Path ".env")) {
        Write-ColorOutput "[CREATE] Creating .env file..." -Color "Info"
        
        # Prompt for GitHub token
        Write-ColorOutput "`n[TOKEN] GitHub Personal Access Token Setup:" -Color "Info"
        Write-ColorOutput "1. Go to: https://github.com/settings/tokens" -Color "Info"
        Write-ColorOutput "2. Click 'Generate new token (classic)'" -Color "Info"
        Write-ColorOutput "3. Select 'public_repo' or 'repo' scope" -Color "Info"
        Write-ColorOutput "4. Copy the generated token" -Color "Info"
        
        $token = Read-Host "`nEnter your GitHub Personal Access Token (or press Enter to skip for now)"
        
        if (-not $token) {
            $token = "your_github_personal_access_token_here"
            Write-ColorOutput "[WARNING] You can add your token later in the .env file" -Color "Warning"
        }
        
        $envContent = @"
GITHUB_TOKEN=$token
PORT=3000
"@
        $envContent | Out-File -FilePath ".env" -Encoding ASCII
        Write-ColorOutput "[SUCCESS] Environment file created" -Color "Success"
    }
    else {
        Write-ColorOutput "[SUCCESS] Environment file already exists" -Color "Success"
    }
}

function Install-Dependencies {
    Write-ColorOutput "[INSTALL] Installing project dependencies..." -Color "Info"
    try {
        npm install
        Write-ColorOutput "[SUCCESS] Dependencies installed successfully!" -Color "Success"
        return $true
    }
    catch {
        Write-ColorOutput "[ERROR] Failed to install dependencies: $($_.Exception.Message)" -Color "Error"
        return $false
    }
}

function Start-Application {
    Write-ColorOutput "[START] Starting GitHub Search MCP..." -Color "Info"
    
    # Start the server in background
    $serverJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm start
    }
    
    # Wait a moment for server to start
    Start-Sleep -Seconds 3
    
    # Check if server started successfully
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
        Write-ColorOutput "[SUCCESS] Server started successfully!" -Color "Success"
        
        if (-not $SkipBrowser) {
            Write-ColorOutput "[BROWSER] Opening browser..." -Color "Info"
            Start-Process "http://localhost:3000"
        }
        
        Write-ColorOutput "`n[SUCCESS] GitHub Search MCP is now running!" -Color "Success"
        Write-ColorOutput "[URL] Web Interface: http://localhost:3000" -Color "Info"
        Write-ColorOutput "[DOCS] Documentation: README.md" -Color "Info"
        Write-ColorOutput "`n[INFO] Press Ctrl+C to stop the server" -Color "Warning"
        
        # Keep the script running and monitor the server
        try {
            while ($true) {
                if ($serverJob.State -eq "Failed" -or $serverJob.State -eq "Stopped") {
                    Write-ColorOutput "[ERROR] Server stopped unexpectedly" -Color "Error"
                    break
                }
                Start-Sleep -Seconds 1
            }
        }
        finally {
            Stop-Job $serverJob -ErrorAction SilentlyContinue
            Remove-Job $serverJob -ErrorAction SilentlyContinue
        }
    }
    catch {
        Write-ColorOutput "[ERROR] Failed to start server: $($_.Exception.Message)" -Color "Error"
        Stop-Job $serverJob -ErrorAction SilentlyContinue
        Remove-Job $serverJob -ErrorAction SilentlyContinue
        return $false
    }
}

# Main execution
try {
    Write-Header "GitHub Search MCP - Complete Setup Bundle"
    Write-ColorOutput "[INIT] Initializing automatic setup..." -Color "Info"
    
    # Check if running as administrator for installations
    if (-not (Test-AdminRights)) {
        Write-ColorOutput "[WARNING] Some installations may require administrator rights" -Color "Warning"
        Write-ColorOutput "   Consider running as administrator for best results" -Color "Warning"
    }
    
    # Step 1: Check and install Chocolatey (optional, for easier installations)
    if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Header "Installing Package Manager"
        if (Test-AdminRights) {
            Install-Chocolatey | Out-Null
        }
        else {
            Write-ColorOutput "[WARNING] Skipping Chocolatey (not running as admin)" -Color "Warning"
        }
    }
    
    # Step 2: Check and install Node.js
    Write-Header "Checking Node.js"
    if (-not (Test-NodeJS)) {
        Install-NodeJS | Out-Null
        if (-not (Test-NodeJS)) {
            throw "Failed to install Node.js"
        }
    }
    
    # Step 3: Check and install Git
    Write-Header "Checking Git"
    if (-not (Test-Git)) {
        Install-Git | Out-Null
        if (-not (Test-Git)) {
            Write-ColorOutput "[WARNING] Git installation may require manual intervention" -Color "Warning"
        }
    }
    
    # Step 4: Setup environment
    Write-Header "Environment Setup"
    Setup-Environment
    
    # Step 5: Install project dependencies
    Write-Header "Project Dependencies"
    if (-not (Install-Dependencies)) {
        throw "Failed to install project dependencies"
    }
    
    # Step 6: Start the application
    Write-Header "Starting Application"
    Start-Application
}
catch {
    Write-ColorOutput "`n[ERROR] Setup failed: $($_.Exception.Message)" -Color "Error"
    Write-ColorOutput "[INFO] Check the README.md for manual setup instructions" -Color "Info"
    exit 1
} 