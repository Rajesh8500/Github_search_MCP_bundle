# GitHub Search MCP 🔍

A comprehensive Model Context Protocol (MCP) server that enables powerful searching across all branches in GitHub repositories, complete with a modern, responsive web interface and advanced export capabilities.

## 🌟 Key Features

### Core Search Functionality
- **🌿 Multi-Branch Search**: Search across all branches in a repository simultaneously
- **📁 Flexible Search Options**: 
  - Search in file contents
  - Search in filenames
  - Search in both simultaneously
- **🎯 Advanced Filtering**: 
  - Filter by file extensions (e.g., `.js`, `.py`, `.java`)
  - Limit results (customizable from 1-200)
  - Repository-specific searches
- **🔗 Direct GitHub Integration**: Each result links directly to the exact line in GitHub

### User Interface
- **🎨 Modern, Responsive Design**: 
  - Beautiful glassmorphism UI with smooth animations
  - Dark/Light theme toggle with persistent preference
  - Mobile-responsive layout
- **🎭 Dual Search Modes**:
  - **Direct Search**: Search with a known repository
  - **Find Repository**: Search for repositories first, then search within
- **📊 Real-time Progress**:
  - Live search progress with branch-by-branch updates
  - API rate limit monitoring
  - Result count tracking
- **🎯 Smart UI Elements**:
  - Hover-reveal search button with icon animation
  - Standardized input heights
  - No unwanted expansion animations
  - High-contrast toast notifications

### Export Capabilities
- **📄 Multiple Export Formats**:
  - **PDF**: Formatted document with clickable links (using jsPDF)
  - **Excel/CSV**: Structured data for analysis
  - **Text**: Plain text with all results
- **📋 Comprehensive Export Data**:
  - Repository and keyword information
  - Branch, file path, and line numbers
  - Direct GitHub URLs
  - Match context

### Performance & UX
- **⚡ Optimized Performance**:
  - Removed heavy backdrop filters
  - GPU acceleration for animations
  - Efficient DOM updates
  - Reduced animation complexity
- **🎨 Enhanced Visual Experience**:
  - Color-coded search results
  - Distinct tab differentiation
  - Improved spacing and readability
  - Consistent theming across all elements

## 🏗️ Architecture

### Technology Stack
```
Frontend:
├── HTML5 (Semantic markup)
├── CSS3 (Modern features, animations)
├── Vanilla JavaScript (ES6+)
└── Font Awesome Icons

Backend:
├── Node.js (v18+)
├── Express.js (Web server)
├── MCP SDK (Model Context Protocol)
├── Axios (HTTP client)
└── dotenv (Environment management)

External:
├── GitHub REST API
├── jsPDF (PDF generation)
└── Server-Sent Events (SSE)
```

### System Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│   Web Browser   │────▶│  Express Server  │────▶│  GitHub API     │
│   (Client UI)   │◀────│  (Port 3000)     │◀────│                 │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│                 │     │                  │
│   MCP Client    │────▶│   MCP Server     │
│ (Claude, etc)   │◀────│   (stdio)        │
│                 │     │                  │
└─────────────────┘     └──────────────────┘
```

### Directory Structure
```
Github-search-MCP/
├── public/                 # Frontend assets
│   ├── index.html         # Main HTML file
│   ├── styles.css         # All styling (5500+ lines)
│   └── script.js          # Frontend logic (3000+ lines)
├── src/                   # Backend source
│   ├── server.js          # Main server & MCP implementation
│   └── github-searcher.js # GitHub API integration
├── .env                   # Environment variables
├── .env.example           # Environment template
├── package.json           # Dependencies & scripts
├── CHANGES_SUMMARY.md     # Recent changes documentation
└── README.md              # This file
```

### Key Components

#### 1. MCP Server (`src/server.js`)
- Implements Model Context Protocol specification
- Provides tools for AI assistants:
  - `search_github_repo`: Multi-branch keyword search
  - `list_repo_branches`: Repository branch listing
- Handles stdio communication with MCP clients

#### 2. Web Server (Express)
- RESTful API endpoints
- Static file serving
- CORS enabled for cross-origin requests
- Server-Sent Events for real-time progress

#### 3. GitHub Integration (`src/github-searcher.js`)
- Handles GitHub API authentication
- Implements rate limiting
- Manages multi-branch searches
- Processes search results

#### 4. Frontend Application
- **Single Page Application (SPA)** design
- **Event-driven architecture**
- **Global state management** for search results
- **Modular component structure**

## 📋 Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **GitHub Personal Access Token**: Required for API access
- **Git**: For cloning the repository
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Github-search-MCP
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file from the example:
```bash
cp .env.example .env
```

Edit the `.env` file and add your GitHub personal access token:
```env
GITHUB_TOKEN=your_github_personal_access_token_here
PORT=3000
```

### 4. Get GitHub Personal Access Token
1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name (e.g., "GitHub Search MCP")
4. Select the following scopes:
   - `repo` (for private repositories)
   - `public_repo` (for public repositories)
5. Copy the generated token and add it to your `.env` file

## 🚀 Usage

### Starting the Server

#### Development Mode (with auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Web Interface Usage

1. **Open the Application**
   - Navigate to `http://localhost:3000` in your browser

2. **Choose Search Mode**
   - **Direct Search**: When you know the repository
   - **Find Repository**: To search for repositories first

3. **Perform a Search**
   - Enter search keyword (e.g., "useState", "TODO", "import")
   - Enter repository (e.g., "facebook/react", "microsoft/vscode")
   - Set max results (default: 50)
   - Optionally filter by file extensions
   - Select search scope (files/filenames/both)

4. **View Results**
   - Results appear in a modal with two tabs:
     - **Results Tab**: Color-coded search matches
     - **Progress Log Tab**: Real-time search progress
   - Click any result to open in GitHub

5. **Export Results**
   - Click "Export Results" button
   - Choose format: PDF, Excel, or Text
   - File downloads automatically with timestamp

### MCP Integration

#### Using with Claude Desktop
Add to your Claude Desktop configuration:
```json
{
  "mcpServers": {
    "github-search": {
      "command": "node",
      "args": ["path/to/Github-search-MCP/src/server.js"],
      "env": {
        "GITHUB_TOKEN": "your_github_token_here"
      }
    }
  }
}
```

#### Available MCP Tools

1. **search_github_repo**
   ```json
   {
     "keyword": "string",
     "repository": "owner/repo",
     "searchInFiles": true,
     "searchInFilenames": true,
     "maxResults": 50,
     "fileExtensions": [".js", ".py"]
   }
   ```

2. **list_repo_branches**
   ```json
   {
     "repository": "owner/repo"
   }
   ```

## 🔧 API Endpoints

### POST `/api/search`
Initiate a repository search.

**Request:**
```json
{
  "keyword": "useState",
  "repository": "facebook/react",
  "searchInFiles": true,
  "searchInFilenames": false,
  "maxResults": 50,
  "fileExtensions": [".js", ".jsx"]
}
```

**Response:**
```json
{
  "searchId": "unique-search-id",
  "message": "Search initiated"
}
```

### GET `/api/search/:searchId/progress`
Server-Sent Events endpoint for real-time progress.

### GET `/api/branches/:owner/:repo`
Get all branches for a repository.

### POST `/api/search-repo`
Search for repositories by keyword.

## 🎨 UI/UX Features

### Theme System
- **Dark Theme**: Default modern dark interface
- **Light Theme**: Clean, bright alternative
- **Persistent Storage**: Theme preference saved locally

### Animations & Transitions
- Smooth page transitions
- Hover effects on interactive elements
- Loading states with spinners
- Toast notifications with slide animations

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px and 1200px
- Touch-friendly interface
- Optimized for all screen sizes

### Accessibility
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- High contrast mode compatible

## 🚨 Error Handling & Rate Limiting

### GitHub API Rate Limits
- **Without Token**: 60 requests/hour
- **With Token**: 5,000 requests/hour
- **Search API**: 30 requests/minute

### Built-in Protections
- Automatic rate limit detection
- Request throttling
- Progress indicators show remaining API calls
- Graceful error messages

### Error Types Handled
- Invalid repository format
- Repository not found
- Rate limit exceeded
- Network failures
- Invalid search parameters
- Export failures

## 🔍 Troubleshooting

### Common Issues

1. **"Repository not found"**
   - Verify format: `owner/repository`
   - Check repository exists and is public/accessible
   - Ensure token has correct permissions

2. **"Rate limit exceeded"**
   - Wait for rate limit reset (shown in UI)
   - Verify GitHub token is valid
   - Reduce search frequency

3. **Export not working**
   - Ensure search has completed
   - Check browser popup blockers (for PDF)
   - Verify sufficient results exist

4. **UI not loading**
   - Clear browser cache
   - Check console for errors
   - Verify server is running

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -am 'Add feature'`
6. Push: `git push origin feature-name`
7. Create Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Update documentation
- Test in both themes
- Ensure mobile compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) for the MCP specification
- [GitHub API](https://docs.github.com/en/rest) for repository access
- [Express.js](https://expressjs.com/) for the web server
- [Axios](https://axios-http.com/) for HTTP requests
- [jsPDF](https://jspdf.com/) for PDF generation
- [Font Awesome](https://fontawesome.com/) for icons

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review existing GitHub issues
3. Create a new issue with:
   - Clear problem description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

## 🚀 Recent Updates

See [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md) for detailed recent changes including:
- Export functionality with multiple formats
- Toast notification visibility improvements
- UI/UX enhancements
- Performance optimizations
- Bug fixes and stability improvements

---

**Built with ❤️ for developers who need powerful GitHub search capabilities**

*Happy Searching! 🔍✨* 