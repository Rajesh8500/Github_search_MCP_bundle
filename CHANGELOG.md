# Changelog

All notable changes to GitHub Search MCP will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-01-14

### 🎉 Major Release - AI-Powered Features

### Added
- **AI Repository Analysis System**
  - One-click AI summary button on all repository cards
  - Comprehensive analysis modal with three tabs (Overview, Structure, Languages)
  - Auto-generated 100-word summaries for selected repositories
  - Mock AI implementation ready for production integration

- **Enhanced Repository Search**
  - Public/Organization search toggle
  - Global search mode for all GitHub repositories
  - Organization-specific search with dynamic input field
  - Support for queries like `org:microsoft react`

- **Interactive File Explorer**
  - Hierarchical file tree visualization
  - Collapsible/expandable folders
  - Click-to-analyze file functionality
  - File-level AI analysis with purpose, components, and dependencies

- **Language Analysis**
  - Visual bar charts for language distribution
  - Percentage-based language statistics
  - Color-coded language indicators
  - Detailed language cards with byte information

- **New API Endpoints**
  - `/api/ai/repository-summary` - Generate repository summaries
  - `/api/ai/repository-analysis` - Comprehensive repository analysis
  - `/api/ai/file-analysis` - Individual file analysis
  - `/api/repository/structure` - Get repository file tree
  - `/api/repository/languages` - Get language statistics

- **UI/UX Enhancements**
  - Purple gradient theme for AI features
  - Loading states with spinners for all AI operations
  - Smooth animations and transitions
  - Interactive file tree with hover effects
  - Enhanced repository cards with dual-action buttons

- **Testing & Documentation**
  - `test-features.html` - Comprehensive test page for all AI features
  - `NEW_FEATURES_SUMMARY.md` - Detailed feature documentation
  - Updated README with AI feature documentation
  - Enhanced requirements.txt with AI service information

### Changed
- Updated repository search to support both public and organization modes
- Enhanced server.js with AI helper methods
- Improved github-searcher.js with structure and language methods
- Upgraded UI with AI-specific styling and components
- Version bumped to 2.0.0 to reflect major feature additions

### Technical Details
- Mock AI implementation for immediate use
- Ready for OpenAI, Anthropic, or Google Gemini integration
- Maintains backward compatibility with existing search features
- No breaking changes to existing API endpoints

## [1.0.0] - 2024-01-10

### Initial Release

### Added
- Multi-branch GitHub repository search
- Real-time search progress with SSE
- Export functionality (PDF, Excel, Text)
- Dark/Light theme toggle
- Repository search mode
- Direct search mode
- Responsive web interface
- MCP protocol integration
- GitHub API integration
- Branch-by-branch search results
- File content and filename search
- File extension filtering
- Result limiting (1-200)
- Direct GitHub links to code lines

### Features
- Modern glassmorphism UI
- Animated search interface
- Progress logging tab
- Result highlighting
- Toast notifications
- Keyboard shortcuts
- Mobile-responsive design
- Persistent theme preference

### Technical
- Node.js/Express backend
- Vanilla JavaScript frontend
- Server-Sent Events for real-time updates
- CORS support
- Environment variable configuration
- GitHub token authentication
- Rate limit handling

---

For more details on recent changes, see [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md) 