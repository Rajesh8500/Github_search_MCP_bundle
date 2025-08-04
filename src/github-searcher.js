import axios from 'axios';
import { config } from 'dotenv';

config();

export class GitHubSearcher {
  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;
    this.apiBase = 'https://api.github.com';
    this.rateLimitDelay = 1000; // 1 second delay between requests
    
    if (!this.githubToken) {
      console.warn('⚠️  GITHUB_TOKEN not found in environment variables. Rate limits will be much lower.');
    }
  }

  /**
   * Get headers for GitHub API requests
   */
  getHeaders() {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Search-MCP/1.0.0'
    };

    if (this.githubToken) {
      headers['Authorization'] = `token ${this.githubToken}`;
    }

    return headers;
  }

  /**
   * Make a request to GitHub API with error handling and rate limiting
   */
  async makeRequest(url, params = {}, progressCallback = null) {
    const progress = progressCallback || ((type, message) => console.log(message));
    
    try {
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        params,
        timeout: 30000
      });

      // Enhanced rate limit information
      const remaining = parseInt(response.headers['x-ratelimit-remaining']) || 0;
      const limit = parseInt(response.headers['x-ratelimit-limit']) || 60;
      const resetTime = parseInt(response.headers['x-ratelimit-reset']) || 0;
      const resetDate = new Date(resetTime * 1000);
      
      // Log detailed rate limit info
      progress('info', `📊 API Rate Limit: ${remaining}/${limit} remaining (resets at ${resetDate.toLocaleTimeString()})`, {
        rateLimitRemaining: remaining,
        rateLimitTotal: limit,
        rateLimitReset: resetDate.toISOString(),
        endpoint: url.replace(this.apiBase, '')
      });
      
      if (remaining < 10) {
        progress('warning', `⚠️  GitHub API rate limit is critically low! Only ${remaining}/${limit} requests remaining. Resets at ${resetDate.toLocaleTimeString()}`, {
          rateLimitRemaining: remaining,
          rateLimitTotal: limit,
          rateLimitReset: resetDate.toISOString(),
          critical: true
        });
      } else if (remaining < 50) {
        progress('warning', `⚠️  GitHub API rate limit getting low: ${remaining}/${limit} requests remaining`, {
          rateLimitRemaining: remaining,
          rateLimitTotal: limit,
          rateLimitReset: resetDate.toISOString()
        });
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;
        const headers = error.response.headers;
        
        // Enhanced error information for rate limits
        const remaining = parseInt(headers['x-ratelimit-remaining']) || 0;
        const limit = parseInt(headers['x-ratelimit-limit']) || 60;
        const resetTime = parseInt(headers['x-ratelimit-reset']) || 0;
        const resetDate = new Date(resetTime * 1000);
        
        switch (status) {
          case 401:
            const authError = 'GitHub API authentication failed. Check your GITHUB_TOKEN.';
            progress('error', `🔐 ${authError}`, {
              errorType: 'authentication',
              status: 401,
              message: authError,
              suggestion: 'Verify your GitHub Personal Access Token is valid and has the necessary permissions.'
            });
            throw new Error(authError);
          case 403:
            if (message.includes('rate limit')) {
              const rateLimitError = `GitHub API rate limit exceeded. ${remaining}/${limit} requests remaining. Resets at ${resetDate.toLocaleTimeString()}.`;
              progress('error', `🚫 ${rateLimitError}`, {
                errorType: 'rate_limit',
                status: 403,
                rateLimitRemaining: remaining,
                rateLimitTotal: limit,
                rateLimitReset: resetDate.toISOString(),
                message: rateLimitError,
                suggestion: 'Wait for rate limit to reset or upgrade your GitHub API plan.'
              });
              throw new Error(rateLimitError);
            }
            const forbiddenError = `GitHub API access forbidden: ${message}`;
            progress('error', `🚫 ${forbiddenError}`, {
              errorType: 'forbidden',
              status: 403,
              message: forbiddenError,
              suggestion: 'Check repository permissions and token scopes.'
            });
            throw new Error(forbiddenError);
          case 404:
            const notFoundError = 'Repository not found or not accessible.';
            progress('error', `❓ ${notFoundError}`, {
              errorType: 'not_found',
              status: 404,
              message: notFoundError,
              suggestion: 'Verify the repository name and ensure it is public or you have access.'
            });
            throw new Error(notFoundError);
          default:
            const apiError = `GitHub API error (${status}): ${message}`;
            progress('error', `⚠️ ${apiError}`, {
              errorType: 'api_error',
              status: status,
              message: apiError,
              originalMessage: message
            });
            throw new Error(apiError);
        }
      }
      const networkError = `Network error: ${error.message}`;
      progress('error', `🌐 ${networkError}`, {
        errorType: 'network',
        message: networkError,
        originalError: error.message
      });
      throw new Error(networkError);
    }
  }

  /**
   * List all branches in a repository
   */
  async listBranches(repository) {
    const url = `${this.apiBase}/repos/${repository}/branches`;
    const branches = await this.makeRequest(url, { per_page: 100 });
    
    return branches.map(branch => ({
      name: branch.name,
      isDefault: branch.name === 'main' || branch.name === 'master',
      lastCommit: {
        sha: branch.commit.sha,
        date: branch.commit.commit?.author?.date || null
      },
      url: branch.commit.url
    }));
  }

  /**
   * Search for keyword across all branches in a repository
   */
  async searchAcrossAllBranches(options) {
    const {
      keyword,
      repository,
      searchInFiles = true,
      searchInFilenames = true,
      fileExtensions = [],
      maxResults = 50,
      progressCallback = null
    } = options;

    const progress = progressCallback || ((type, message) => console.log(message));

    progress('info', `🔍 Searching for "${keyword}" in ${repository} across all branches...`);

    // Get all branches first
    const branches = await this.listBranches(repository);
    progress('info', `📋 Found ${branches.length} branches to search`, { branchCount: branches.length });

    const allResults = [];
    let searchCount = 0;

    for (const [index, branch] of branches.entries()) {
      if (searchCount >= maxResults) break;

      progress('branch', `🌿 Searching branch ${index + 1}/${branches.length}: ${branch.name} ${branch.isDefault ? '(default)' : ''}`, { 
        branchName: branch.name,
        branchIndex: index + 1,
        totalBranches: branches.length,
        isDefault: branch.isDefault,
        lastCommit: branch.lastCommit?.sha?.substring(0, 7)
      });
      
      try {
        // Add delay to respect rate limits
        if (searchCount > 0) {
          progress('info', `⏱️  Waiting ${this.rateLimitDelay}ms to respect rate limits...`);
          await this.delay(this.rateLimitDelay);
        }

        const branchResults = await this.searchInBranch({
          keyword,
          repository,
          branch: branch.name,
          searchInFiles,
          searchInFilenames,
          fileExtensions,
          maxResults: maxResults - searchCount,
          progressCallback
        });

        // Process and enhance results with detailed information
        const enhancedResults = branchResults.map(result => ({
          ...result,
          repository,
          branchInfo: {
            name: branch.name,
            isDefault: branch.isDefault,
            lastCommit: branch.lastCommit
          }
        }));

        allResults.push(...enhancedResults);
        searchCount += branchResults.length;

        if (branchResults.length > 0) {
          progress('results', `   ✅ Found ${branchResults.length} matches in branch "${branch.name}"`, {
            branchName: branch.name,
            resultsCount: branchResults.length,
            results: enhancedResults.slice(0, 3).map(r => ({
              file: r.filePath,
              line: r.lineNumber,
              url: r.url
            }))
          });
          
          // Send individual results for real-time display
          for (const result of enhancedResults) {
            progress('match', `   📄 ${result.filePath}${result.lineNumber ? `:${result.lineNumber}` : ''} in ${branch.name}`, {
              result,
              branchName: branch.name
            });
          }
        } else {
          progress('info', `   ❌ No matches found in branch "${branch.name}"`);
        }

      } catch (error) {
        progress('error', `⚠️  Error searching branch ${branch.name}: ${error.message}`, {
          branchName: branch.name,
          error: error.message,
          errorType: 'branch_search_error'
        });
        continue;
      }
    }

    progress('complete', `✅ Search completed. Found ${allResults.length} total results.`, {
      totalResults: allResults.length
    });
    return allResults.slice(0, maxResults);
  }

  /**
   * Search for keyword in a specific branch
   */
  async searchInBranch(options) {
    const {
      keyword,
      repository,
      branch,
      searchInFiles,
      searchInFilenames,
      fileExtensions,
      maxResults,
      progressCallback = null
    } = options;

    const progress = progressCallback || ((type, message) => console.log(message));
    const results = [];
    
    try {
      // Search in file contents
      if (searchInFiles) {
        const fileResults = await this.searchFileContents({
          keyword,
          repository,
          branch,
          fileExtensions,
          maxResults: Math.floor(maxResults / 2),
          progressCallback
        });
        results.push(...fileResults);
      }

      // Search in filenames
      if (searchInFilenames) {
        const nameResults = await this.searchFilenames({
          keyword,
          repository,
          branch,
          fileExtensions,
          maxResults: Math.floor(maxResults / 2),
          progressCallback
        });
        results.push(...nameResults);
      }

    } catch (error) {
      progress('warning', `Error searching in branch ${branch}: ${error.message}`, {
        branchName: branch,
        error: error.message
      });
    }

    return results;
  }

  /**
   * Search in file contents using GitHub's code search API
   */
  async searchFileContents(options) {
    const { keyword, repository, branch, fileExtensions, maxResults, progressCallback = null } = options;
    const progress = progressCallback || ((type, message) => console.log(message));
    
    // Build search query
    let query = `${keyword} repo:${repository}`;
    
    if (fileExtensions.length > 0) {
      const extensions = fileExtensions.map(ext => `extension:${ext.replace('.', '')}`).join(' ');
      query += ` ${extensions}`;
    }

    try {
      const url = `${this.apiBase}/search/code`;
      const data = await this.makeRequest(url, {
        q: query,
        per_page: Math.min(maxResults, 100)
      }, progressCallback);

      const results = [];
      
      for (const item of data.items || []) {
        // Try to get the specific branch version
        try {
          const fileContent = await this.getFileContent(repository, item.path, branch);
          const matches = this.findKeywordInContent(keyword, fileContent, item.path, branch, repository);
          results.push(...matches);
        } catch (error) {
          // If we can't get the specific branch, use the search result
          results.push({
            branch: branch,
            filePath: item.path,
            matchType: 'content',
            context: item.text_matches?.[0]?.fragment || 'Match found in file',
            url: item.html_url,
            score: item.score
          });
        }
      }

      return results;
    } catch (error) {
      progress('warning', `Error searching file contents: ${error.message}`, {
        error: error.message
      });
      return [];
    }
  }

  /**
   * Search in filenames
   */
  async searchFilenames(options) {
    const { keyword, repository, branch, fileExtensions, maxResults, progressCallback = null } = options;
    const progress = progressCallback || ((type, message) => console.log(message));
    
    try {
      // Get repository tree for the specific branch
      const url = `${this.apiBase}/repos/${repository}/git/trees/${branch}`;
      const tree = await this.makeRequest(url, { recursive: 1 }, progressCallback);
      
      const results = [];
      
      for (const item of tree.tree || []) {
        if (item.type !== 'blob') continue;
        
        const fileName = item.path.toLowerCase();
        const keywordLower = keyword.toLowerCase();
        
        // Check if filename contains keyword
        if (fileName.includes(keywordLower)) {
          // Check file extension filter
          if (fileExtensions.length > 0) {
            const hasValidExtension = fileExtensions.some(ext => 
              fileName.endsWith(ext.toLowerCase())
            );
            if (!hasValidExtension) continue;
          }
          
          results.push({
            branch: branch,
            filePath: item.path,
            matchType: 'filename',
            context: `Filename contains "${keyword}"`,
            url: `https://github.com/${repository}/blob/${branch}/${item.path}`,
            score: fileName === keywordLower ? 100 : 50
          });
          
          if (results.length >= maxResults) break;
        }
      }
      
      return results;
    } catch (error) {
      progress('warning', `Error searching filenames in branch ${branch}: ${error.message}`, {
        branchName: branch,
        error: error.message
      });
      return [];
    }
  }

  /**
   * Get file content from a specific branch
   */
  async getFileContent(repository, filePath, branch) {
    const url = `${this.apiBase}/repos/${repository}/contents/${filePath}`;
    const data = await this.makeRequest(url, { ref: branch });
    
    if (data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    
    throw new Error('File content not available');
  }

  /**
   * Find keyword matches in file content with context
   */
  findKeywordInContent(keyword, content, filePath, branch, repository) {
    const lines = content.split('\n');
    const keywordLower = keyword.toLowerCase();
    const results = [];
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(keywordLower)) {
        // Get context (3 lines before and after)
        const contextStart = Math.max(0, index - 3);
        const contextEnd = Math.min(lines.length, index + 4);
        const context = lines.slice(contextStart, contextEnd).join('\n');
        
        results.push({
          branch: branch,
          filePath: filePath,
          lineNumber: index + 1,
          matchType: 'content',
          context: context,
          url: `https://github.com/${repository}/blob/${branch}/${filePath}#L${index + 1}`,
          score: 75
        });
      }
    });
    
    return results;
  }

  /**
   * Search for repositories on GitHub
   */
  async searchRepositories(keyword, options = {}) {
    const { maxResults = 20, sort = 'stars' } = options;
    
    try {
      const url = `${this.apiBase}/search/repositories`;
      const data = await this.makeRequest(url, {
        q: keyword,
        sort: sort,
        order: 'desc',
        per_page: Math.min(maxResults, 100)
      });

      return data.items || [];
    } catch (error) {
      console.warn(`Error searching repositories: ${error.message}`);
      return [];
    }
  }

  /**
   * Utility function to add delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 