import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GitHubSearcher } from './github-searcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug environment variables
console.log('🔧 [ENV-DEBUG] Environment variables check:');
console.log('  - GITHUB_TOKEN exists:', !!process.env.GITHUB_TOKEN);
console.log('  - GITHUB_TOKEN length:', process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.length : 0);
console.log('  - GITHUB_TOKEN prefix:', process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.substring(0, 7) + '...' : 'none');
console.log('  - PORT:', process.env.PORT || 'default');

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

    // Store active SSE connections
    const sseConnections = new Map();

    // Enhanced SSE endpoint with extensive debugging
    app.get('/api/search/progress/:searchId', (req, res) => {
        const searchId = req.params.searchId;
        console.log(`🔧 [SERVER] New SSE connection request for searchId: ${searchId}`);
        console.log(`🔧 [SERVER] Request method: ${req.method}`);
        console.log(`🔧 [SERVER] Request URL: ${req.url}`);
        console.log(`🔧 [SERVER] Request headers:`, {
            'accept': req.headers.accept,
            'cache-control': req.headers['cache-control'],
            'connection': req.headers.connection,
            'user-agent': req.headers['user-agent'],
            'referer': req.headers.referer
        });
        console.log(`🔧 [SERVER] Current sseConnections map size: ${sseConnections.size}`);
        console.log(`🔧 [SERVER] Current sseConnections keys:`, Array.from(sseConnections.keys()));
        
        // Handle HEAD requests (for testing)
        if (req.method === 'HEAD') {
            console.log(`🔧 [SERVER] HEAD request for ${searchId}, responding with 200`);
            res.status(200).end();
            return;
        }
        
        // Set SSE headers
        console.log(`🔧 [SERVER] Setting SSE headers for ${searchId}`);
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
            'X-Accel-Buffering': 'no' // Disable nginx buffering
        });

        // Initialize connections array if it doesn't exist
        if (!sseConnections.has(searchId)) {
            sseConnections.set(searchId, []);
            console.log(`🔧 [SERVER] Created new connections array for ${searchId}`);
        } else {
            console.log(`🔧 [SERVER] Using existing connections array for ${searchId} (${sseConnections.get(searchId).length} existing)`);
        }
        
        // Add this connection to the array
        const connections = sseConnections.get(searchId);
        connections.push(res);
        console.log(`✅ [SERVER] Added connection ${connections.length} for ${searchId}`);
        console.log(`✅ [SERVER] Total connections for ${searchId}: ${connections.length}`);
        console.log(`✅ [SERVER] All searchIds in map:`, Array.from(sseConnections.keys()));
        
        // Send initial connection confirmation
        try {
            const confirmationMessage = {
                type: 'connected',
                message: '🔗 [SERVER] Connected to search progress stream',
                timestamp: new Date().toISOString(),
                searchId: searchId,
                connectionId: connections.length,
                totalConnections: connections.length
            };
            
            const sseData = `data: ${JSON.stringify(confirmationMessage)}\n\n`;
            res.write(sseData);
            console.log(`✅ [SERVER] Sent connection confirmation to ${searchId}:`, confirmationMessage);
        } catch (error) {
            console.error(`❌ [SERVER] Error sending connection confirmation to ${searchId}:`, error);
        }
        
        // Send a test message after 1 second to verify connection works
        setTimeout(() => {
            try {
                const testMessage = {
                    type: 'info',
                    message: '🧪 [SERVER] Test message from server - connection verified',
                    timestamp: new Date().toISOString(),
                    searchId: searchId
                };
                
                const sseData = `data: ${JSON.stringify(testMessage)}\n\n`;
                res.write(sseData);
                console.log(`�� [SERVER] Sent test message to ${searchId}`);
            } catch (error) {
                console.error(`❌ [SERVER] Error sending test message to ${searchId}:`, error);
            }
        }, 1000);

        // Handle client disconnect
        req.on('close', () => {
            console.log(`🔧 [SERVER] Client disconnected from ${searchId}`);
            const currentConnections = sseConnections.get(searchId);
            if (currentConnections) {
                const index = currentConnections.indexOf(res);
                if (index !== -1) {
                    currentConnections.splice(index, 1);
                    console.log(`🧹 [SERVER] Removed connection ${index + 1} from ${searchId}, ${currentConnections.length} remaining`);
                } else {
                    console.log(`⚠️ [SERVER] Connection not found in array for ${searchId}`);
                }
                
                // Clean up if no connections remain
                if (currentConnections.length === 0) {
                    sseConnections.delete(searchId);
                    console.log(`🧹 [SERVER] Cleaned up empty connections for ${searchId}`);
                }
            } else {
                console.log(`⚠️ [SERVER] No connections array found for ${searchId} during cleanup`);
            }
            
            console.log(`🔧 [SERVER] After cleanup - map size: ${sseConnections.size}, keys:`, Array.from(sseConnections.keys()));
        });

        req.on('error', (error) => {
            console.error(`❌ [SERVER] Connection error for ${searchId}:`, error);
        });
        
        // Debug: Log connection state periodically
        const connectionDebugInterval = setInterval(() => {
            const currentConnections = sseConnections.get(searchId);
            console.log(`🔧 [SERVER] Connection state check for ${searchId}: ${currentConnections?.length || 0} connections`);
            
            // Stop debugging after 30 seconds
            if (Date.now() - parseInt(searchId) > 30000) {
                clearInterval(connectionDebugInterval);
            }
        }, 5000);
    });

    // Enhanced sendProgress function with extensive debugging
    const sendProgress = (searchId, type, message, data = {}) => {
        console.log(`🔧 [SERVER] sendProgress called with searchId: ${searchId}, type: ${type}`);
        console.log(`🔧 [SERVER] sendProgress message: ${message}`);
        console.log(`🔧 [SERVER] sendProgress data keys:`, Object.keys(data));
        console.log(`🔧 [SERVER] Current sseConnections map size: ${sseConnections.size}`);
        console.log(`🔧 [SERVER] All available searchIds:`, Array.from(sseConnections.keys()));
        
        const connections = sseConnections.get(searchId);
        console.log(`🔧 [SERVER] Retrieved connections for ${searchId}:`, connections ? `array with ${connections.length} items` : 'null/undefined');
        
        if (connections) {
            console.log(`🔧 [SERVER] Connections array details:`, {
                length: connections.length,
                isArray: Array.isArray(connections),
                type: typeof connections
            });
        }
        
        console.log(`🔧 [SSE] Sending ${type} to searchId ${searchId}:`, { 
            message, 
            connectionsCount: connections?.length || 0,
            hasData: Object.keys(data).length > 0,
            timestamp: new Date().toISOString()
        });
        
        if (connections && connections.length > 0) {
            const payload = {
                type,
                message,
                timestamp: new Date().toISOString(),
                ...data
            };
            
            const sseData = `data: ${JSON.stringify(payload)}\n\n`;
            console.log(`🔧 [SSE] Raw payload being sent:`, JSON.stringify(payload, null, 2));
            
            let successCount = 0;
            let errorCount = 0;
            
            connections.forEach((res, index) => {
                try {
                    console.log(`🔧 [SSE] Attempting to write to connection ${index + 1}/${connections.length}`);
                    res.write(sseData);
                    console.log(`✅ [SSE] Successfully sent to connection ${index + 1}/${connections.length}`);
                    successCount++;
                } catch (error) {
                    console.error(`❌ [SSE] Error sending to connection ${index + 1}:`, error);
                    errorCount++;
                    // Don't remove failed connection immediately - let the close event handle it
                }
            });
            
            console.log(`📊 [SSE] Send summary for ${searchId}: ${successCount} successful, ${errorCount} failed`);
            
        } else {
            console.log(`⚠️ [SSE] No active connections for searchId: ${searchId}`);
            console.log(`🔧 [SSE] Detailed debug:`);
            console.log(`   - sseConnections.has(${searchId}):`, sseConnections.has(searchId));
            console.log(`   - sseConnections.get(${searchId}):`, sseConnections.get(searchId));
            console.log(`   - Available searchIds:`, Array.from(sseConnections.keys()));
            console.log(`   - Map size:`, sseConnections.size);
            
            // Log all connections for debugging
            for (const [key, value] of sseConnections.entries()) {
                console.log(`   - ${key}: ${value ? value.length : 'null'} connections`);
            }
        }
    };

    // Enhanced search endpoint - start search immediately, no waiting
    app.post('/api/search', async (req, res) => {
        try {
            const { keyword, repository, options = {} } = req.body;
            
            if (!keyword || !repository) {
                return res.status(400).json({
                    success: false,
                    error: 'Keyword and repository are required'
                });
            }
            
            // Generate unique search ID
            const searchId = Date.now().toString();
            console.log(`🔍 [SEARCH] Starting search ${searchId} for "${keyword}" in ${repository}`);
            
            // Send immediate response with search ID
            res.json({
                success: true,
                searchId: searchId,
                message: 'Search initiated successfully'
            });
            
            // Start search immediately - don't wait for SSE connections
            console.log(`🔍 [SEARCH] Starting GitHub search immediately for ${searchId}...`);
            
            // Create enhanced progress callback
            const progressCallback = (type, message, data = {}) => {
                const timestamp = Date.now();
                const logMessage = `[${searchId}] [${type.toUpperCase()}] ${message}`;
                
                // Log to server console for debugging
                console.log(logMessage);
                if (data && Object.keys(data).length > 0) {
                    console.log(`[${searchId}] Data:`, JSON.stringify(data, null, 2));
                }
                
                // Send to client via SSE with full console log data
                sendProgress(searchId, type, message, {
                    ...data,
                    consoleLog: {
                        timestamp,
                        level: type.toUpperCase(),
                        message: logMessage,
                        data: data && Object.keys(data).length > 0 ? data : null
                    }
                });
            };
            
            // Send initial progress message
            setTimeout(() => {
                console.log(`🔍 [SEARCH] Sending initial progress for ${searchId}`);
                sendProgress(searchId, 'start', `🔍 Starting search for "${keyword}" in ${repository}...`, {
                    keyword,
                    repository
                });
            }, 100); // Small delay to allow SSE connection to establish
            
            // Start the actual search
            const results = await this.githubSearcher.searchAcrossAllBranches({
                keyword,
                repository,
                progressCallback,
                ...options
            });
            
            // Send completion
            sendProgress(searchId, 'complete', `✅ Search completed. Found ${results.length} total results.`, {
                totalResults: results.length
            });
            
            // Close SSE connection after a delay
            setTimeout(() => {
                sendProgress(searchId, 'close', 'Search session ended');
                sseConnections.delete(searchId);
                console.log(`🧹 [SEARCH] Cleaned up search session ${searchId}`);
            }, 5000);
            
        } catch (error) {
            console.error('Search endpoint error:', error);
            const searchId = req.body.searchId || 'unknown';
            
            // Send error to any active SSE connections
            sendProgress(searchId, 'error', `❌ Search failed: ${error.message}`);
            
            // If response hasn't been sent yet, send error response
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    searchId: searchId
                });
            }
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

    app.post('/api/search/repositories', async (req, res) => {
        try {
            const { keyword } = req.body;
            
            if (!keyword) {
                return res.status(400).json({ 
                    error: 'Keyword is required',
                    success: false
                });
            }

            const repositories = await this.githubSearcher.searchRepositories(keyword);
            
            res.json({ 
                success: true, 
                repositories,
                keyword
            });
        } catch (error) {
            console.error('Repository search error:', error);
            res.status(500).json({ 
                error: error.message || 'Repository search failed',
                success: false
            });
        }
    });

    // Test SSE endpoint for debugging
    app.get('/api/test-sse/:testId', (req, res) => {
        const testId = req.params.testId;
        console.log(`🧪 [TEST-SSE] Starting test SSE for testId: ${testId}`);
        
        // Set SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
            'X-Accel-Buffering': 'no'
        });

        // Send initial test message
        res.write(`data: ${JSON.stringify({
            type: 'test-start',
            message: '🧪 Test SSE connection established',
            timestamp: new Date().toISOString(),
            testId: testId
        })}\n\n`);

        let messageCount = 0;
        const testInterval = setInterval(() => {
            messageCount++;
            res.write(`data: ${JSON.stringify({
                type: 'test-progress',
                message: `🧪 Test message ${messageCount}`,
                timestamp: new Date().toISOString(),
                messageCount: messageCount
            })}\n\n`);

            if (messageCount >= 5) {
                res.write(`data: ${JSON.stringify({
                    type: 'test-complete',
                    message: '🧪 Test SSE completed successfully',
                    timestamp: new Date().toISOString(),
                    totalMessages: messageCount
                })}\n\n`);
                clearInterval(testInterval);
                setTimeout(() => res.end(), 1000);
            }
        }, 1000);

        req.on('close', () => {
            console.log(`🧪 [TEST-SSE] Client disconnected from test ${testId}`);
            clearInterval(testInterval);
        });
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