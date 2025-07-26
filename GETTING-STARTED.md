# 🚀 Getting Started - GitHub Search MCP

Welcome! This guide will get you up and running with GitHub Search MCP in just a few clicks.

## 🎯 Quick Start (Recommended)

### Windows Users

**Option 1: Double-Click Setup (Easiest)**
1. **Double-click** `start.bat` 
2. Follow the prompts
3. The browser will open automatically at `http://localhost:3000`

**Option 2: PowerShell Command**
```powershell
.\setup-bundle.ps1
```

**Option 3: If you have Node.js already**
```powershell
.\quick-start.ps1
```

### Mac/Linux Users

**Make executable and run:**
```bash
chmod +x run.sh
./run.sh
```

**Or use npm:**
```bash
npm run setup:unix
```

## 🛠️ What the Auto-Installer Does

✅ **Checks and installs Node.js** (if needed)  
✅ **Checks and installs Git** (if needed)  
✅ **Sets up environment variables**  
✅ **Installs project dependencies**  
✅ **Starts the server**  
✅ **Opens your browser automatically**  

## 🔑 GitHub Token Setup

During setup, you'll be prompted for a GitHub Personal Access Token:

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Give it a name: `GitHub Search MCP`
4. Select scope: **`public_repo`** (for public repos) or **`repo`** (for private repos)
5. Copy the generated token
6. Paste it when prompted

> **Note:** You can skip this step and add the token later in the `.env` file

## 🌐 Using the Web Interface

Once started, the web interface will be available at: **http://localhost:3000**

### Example Search:
- **Keyword**: `useState`
- **Repository**: `facebook/react`
- **Options**: ✅ Search in files, ✅ Search in filenames
- **Click**: "Search Repository"

Results will appear in a popup with:
- File paths and line numbers
- Code context
- Branch information
- Direct GitHub links

## 🔧 Manual Commands (Alternative)

If you prefer manual setup:

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your GitHub token

# Start the server
npm start
```

## 🎯 MCP Integration

To use with Claude Desktop or other MCP clients, add this to your MCP configuration:

```json
{
  "mcpServers": {
    "github-search": {
      "command": "node",
      "args": ["path/to/Github-search-MCP/src/server.js"],
      "env": {
        "GITHUB_TOKEN": "your_token_here"
      }
    }
  }
}
```

## 🚨 Troubleshooting

### "PowerShell execution policy" error
Run this command as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Node.js not found" after installation
- Restart your terminal/command prompt
- Or restart your computer

### "GitHub API authentication failed"
- Check your token in the `.env` file
- Ensure the token has the correct permissions
- Generate a new token if needed

### Server won't start
- Check if port 3000 is already in use
- Try changing the port in `.env`: `PORT=3001`

## 🆘 Need Help?

1. **Check the logs** in the terminal for error messages
2. **Read the full README.md** for detailed documentation
3. **Verify your GitHub token** has the right permissions
4. **Try the manual setup** if auto-installer fails

## 🎉 Success!

If everything worked, you should see:
- ✅ Server running message
- 🌐 Browser opens to `http://localhost:3000`
- 🔍 Ready to search GitHub repositories across all branches!

---

**Happy Searching! 🔍✨** 