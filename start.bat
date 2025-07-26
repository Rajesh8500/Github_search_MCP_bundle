@echo off
title GitHub Search MCP - Auto Setup
echo.
echo ===============================================
echo  GitHub Search MCP - One-Click Setup
echo ===============================================
echo.
echo This will automatically:
echo  - Check and install Node.js if needed
echo  - Check and install Git if needed  
echo  - Set up the environment
echo  - Install dependencies
echo  - Start the application
echo  - Open your browser
echo.
echo For best results, run as Administrator
echo.
pause

cd /d "%~dp0"

:: Check if PowerShell execution policy allows scripts
powershell -Command "Get-ExecutionPolicy" | findstr /I "Restricted" >nul
if %errorlevel% equ 0 (
    echo Setting PowerShell execution policy...
    powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
)

:: Run the setup script
powershell -ExecutionPolicy Bypass -File "setup-bundle.ps1"

if %errorlevel% neq 0 (
    echo.
    echo ===============================================
    echo  Setup completed with errors
    echo ===============================================
    echo Check the output above for any issues
    pause
) else (
    echo.
    echo ===============================================
    echo  Setup completed successfully!
    echo ===============================================
)

pause 