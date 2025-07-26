import { config } from 'dotenv';

// Load environment variables first
config();

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { GitHubSearcher } from './github-searcher.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GitHubSearchMCP {
  constructor() {
    this.server = new Server(
      {
        name: 'github-search-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.githubSearcher = new GitHubSearcher();
    this.setupToolHandlers();
    this.setupWebServer();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_github_repo',
            description: 'Search for keywords across all branches in a GitHub repository',
            inputSchema: {
              type: 'object',
              properties: {
                keyword: {
                  type: 'string',
                  description: 'The keyword to search for in the repository'
                },
                repository: {
                  type: 'string',
                  description: 'GitHub repository in format "owner/repo" (e.g., "microsoft/vscode")'
                },
                searchInFiles: {
                  type: 'boolean',
                  description: 'Whether to search in file contents (default: true)',
                  default: true
                },
                searchInFilenames: {
                  type: 'boolean',
                  description: 'Whether to search in file names (default: true)',
                  default: true
                },
                fileExtensions: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'File extensions to filter by (e.g., [".js", ".py"])'
                },
                maxResults: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 50)',
                  default: 50
                }
              },
              required: ['keyword', 'repository']
            }
          },
          {
            name: 'list_repo_branches',
            description: 'List all branches in a GitHub repository',
            inputSchema: {
              type: 'object',
              properties: {
                repository: {
                  type: 'string',
                  description: 'GitHub repository in format "owner/repo"'
                }
              },
              required: ['repository']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'search_github_repo':
            return await this.handleSearchRepo(args);
          case 'list_repo_branches':
            return await this.handleListBranches(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  async handleSearchRepo(args) {
    const {
      keyword,
      repository,
      searchInFiles = true,
      searchInFilenames = true,
      fileExtensions = [],
      maxResults = 50
    } = args;

    const results = await this.githubSearcher.searchAcrossAllBranches({
      keyword,
      repository,
      searchInFiles,
      searchInFilenames,
      fileExtensions,
      maxResults
    });

    return {
      content: [
        {
          type: 'text',
          text: this.formatSearchResults(results, keyword, repository)
        }
      ]
    };
  }

  async handleListBranches(args) {
    const { repository } = args;
    const branches = await this.githubSearcher.listBranches(repository);

    return {
      content: [
        {
          type: 'text',
          text: this.formatBranchList(branches, repository)
        }
      ]
    };
  }

  formatSearchResults(results, keyword, repository) {
    if (!results || results.length === 0) {
      return `No results found for keyword "${keyword}" in repository ${repository}`;
    }

    let output = `# Search Results for "${keyword}" in ${repository}\n\n`;
    output += `Found ${results.length} results across all branches:\n\n`;

    results.forEach((result, index) => {
      output += `## Result ${index + 1}\n`;
      output += `- **Branch**: ${result.branch}\n`;
      output += `- **File**: ${result.filePath}\n`;
      output += `- **Line**: ${result.lineNumber || 'N/A'}\n`;
      output += `- **Match Type**: ${result.matchType}\n`;
      
      if (result.context) {
        output += `- **Context**:\n\`\`\`\n${result.context}\n\`\`\`\n`;
      }
      
      if (result.url) {
        output += `- **GitHub URL**: ${result.url}\n`;
      }
      
      output += '\n---\n\n';
    });

    return output;
  }

  formatBranchList(branches, repository) {
    if (!branches || branches.length === 0) {
      return `No branches found for repository ${repository}`;
    }

    let output = `# Branches in ${repository}\n\n`;
    output += `Total branches: ${branches.length}\n\n`;

    branches.forEach((branch, index) => {
      output += `${index + 1}. **${branch.name}**`;
      if (branch.isDefault) {
        output += ' (default)';
      }
      output += `\n   - Last commit: ${branch.lastCommit?.sha?.substring(0, 7) || 'N/A'}\n`;
      output += `   - Last updated: ${branch.lastCommit?.date || 'N/A'}\n\n`;
    });

    return output;
  }

  setupWebServer() {
    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(cors());
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../public')));

    // API endpoints for the web interface
    app.post('/api/search', async (req, res) => {
      try {
        const { keyword, repository, options = {} } = req.body;
        
        if (!keyword || !repository) {
          return res.status(400).json({ 
            error: 'Keyword and repository are required' 
          });
        }

        const results = await this.githubSearcher.searchAcrossAllBranches({
          keyword,
          repository,
          ...options
        });

        res.json({ 
          success: true, 
          results,
          summary: {
            totalResults: results.length,
            keyword,
            repository
          }
        });
      } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
          error: error.message || 'Search failed',
          success: false
        });
      }
    });

    app.get('/api/branches/:owner/:repo', async (req, res) => {
      try {
        const repository = `${req.params.owner}/${req.params.repo}`;
        const branches = await this.githubSearcher.listBranches(repository);
        
        res.json({ 
          success: true, 
          branches,
          repository
        });
      } catch (error) {
        console.error('Branches error:', error);
        res.status(500).json({ 
          error: error.message || 'Failed to fetch branches',
          success: false
        });
      }
    });

    app.listen(PORT, () => {
      console.log(`GitHub Search MCP Web Interface running on http://localhost:${PORT}`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('GitHub Search MCP server running on stdio');
  }
}

// Start the server
const mcpServer = new GitHubSearchMCP();
mcpServer.run().catch(console.error); 