# GitHub Search MCP

A comprehensive Model Context Protocol (MCP) server that enables searching for keywords across all branches in GitHub repositories, complete with a user-friendly web interface.

## 🚀 Features

- **Multi-Branch Search**: Search across all branches in a repository, not just the main branch
- **Flexible Search Options**: Search in file contents, filenames, or both
- **Advanced Filtering**: Filter by file extensions and limit results
- **Beautiful Web UI**: Customer-friendly interface with search form and popup results
- **MCP Integration**: Full MCP server implementation for AI assistant integration
- **Real-time Results**: Live search with progress indicators
- **Export Functionality**: Export search results to JSON format
- **GitHub Integration**: Direct links to GitHub files and branches

## 📋 Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **GitHub Personal Access Token**: Required for API access
- **Git**: For cloning the repository

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

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Web Interface

1. Open your browser and navigate to `http://localhost:3000`
2. Fill in the search form:
   - **Search Keyword**: The term you want to search for
   - **Repository**: In format `owner/repository` (e.g., `microsoft/vscode`)
   - **Max Results**: Maximum number of results to return
   - **File Extensions**: Optional filter (e.g., `.js,.py,.java`)
   - **Search Options**: Choose to search in file contents and/or filenames
3. Click "Search Repository"
4. View results in the popup modal

### MCP Integration

#### Using with Claude Desktop

Add the following to your Claude Desktop configuration:

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
   - Search for keywords across all branches
   - Parameters: keyword, repository, search options
   - Returns formatted search results

2. **list_repo_branches**
   - List all branches in a repository
   - Parameters: repository
   - Returns branch information with commit details

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_TOKEN` | Yes | - | GitHub personal access token |
| `PORT` | No | 3000 | Server port |
| `GITHUB_API_RATE_LIMIT_DELAY` | No | 1000 | Delay between API calls (ms) |
| `DEFAULT_MAX_RESULTS` | No | 50 | Default maximum results |

### Search Options

- **Search in Files**: Search within file contents
- **Search in Filenames**: Search in file and directory names
- **File Extensions**: Filter results by file type (e.g., `.js`, `.py`, `.java`)
- **Max Results**: Limit the number of returned results (1-200)

## 📊 API Endpoints

### Web API

#### POST `/api/search`
Search for keywords in a repository.

**Request Body:**
```json
{
  "keyword": "string",
  "repository": "owner/repo",
  "options": {
    "searchInFiles": true,
    "searchInFilenames": true,
    "maxResults": 50,
    "fileExtensions": [".js", ".py"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "results": [...],
  "summary": {
    "totalResults": 25,
    "keyword": "search-term",
    "repository": "owner/repo"
  }
}
```

#### GET `/api/branches/:owner/:repo`
Get all branches for a repository.

**Response:**
```json
{
  "success": true,
  "branches": [...],
  "repository": "owner/repo"
}
```

## 🎯 Example Searches

### Basic Search
- **Keyword**: `useState`
- **Repository**: `facebook/react`
- **Result**: Finds all occurrences of "useState" across all React branches

### Advanced Search
- **Keyword**: `function`
- **Repository**: `microsoft/vscode`
- **File Extensions**: `.js,.ts`
- **Options**: Search in files only
- **Result**: Finds "function" keyword only in JavaScript/TypeScript files

### Filename Search
- **Keyword**: `test`
- **Repository**: `nodejs/node`
- **Options**: Search in filenames only
- **Result**: Finds all files with "test" in their name

## 🚨 Rate Limiting

GitHub API has rate limits:
- **Without Token**: 60 requests per hour
- **With Token**: 5,000 requests per hour

The application includes built-in rate limiting and will automatically delay requests to avoid exceeding limits.

## 🛡️ Error Handling

The application handles various error scenarios:
- Invalid repository format
- Repository not found or not accessible
- GitHub API rate limit exceeded
- Network connectivity issues
- Invalid search parameters

## 🔍 Troubleshooting

### Common Issues

1. **"Repository not found"**
   - Verify the repository format: `owner/repository`
   - Check if the repository exists and is accessible
   - Ensure your token has the correct permissions

2. **"Rate limit exceeded"**
   - Wait for the rate limit to reset
   - Ensure you're using a valid GitHub token
   - Reduce the frequency of searches

3. **"Search failed"**
   - Check your internet connection
   - Verify the GitHub token is valid
   - Try a different keyword or repository

4. **No results found**
   - Try different search terms
   - Check if the keyword exists in the repository
   - Verify search options (file contents vs filenames)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) for the MCP specification
- [GitHub API](https://docs.github.com/en/rest) for repository access
- [Express.js](https://expressjs.com/) for the web server
- [Axios](https://axios-http.com/) for HTTP requests

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the GitHub issues page
3. Create a new issue with detailed information about your problem

---

**Happy Searching! 🔍✨** 