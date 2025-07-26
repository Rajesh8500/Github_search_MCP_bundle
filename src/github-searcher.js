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
  async makeRequest(url, params = {}) {
    try {
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        params,
        timeout: 30000
      });

      // Check rate limit
      const remaining = parseInt(response.headers['x-ratelimit-remaining']);
      if (remaining < 10) {
        console.warn('⚠️  GitHub API rate limit is low. Consider waiting or adding a GitHub token.');
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;
        
        switch (status) {
          case 401:
            throw new Error('GitHub API authentication failed. Check your GITHUB_TOKEN.');
          case 403:
            if (message.includes('rate limit')) {
              throw new Error('GitHub API rate limit exceeded. Please wait or add a GitHub token.');
            }
            throw new Error(`GitHub API access forbidden: ${message}`);
          case 404:
            throw new Error('Repository not found or not accessible.');
          default:
            throw new Error(`GitHub API error (${status}): ${message}`);
        }
      }
      throw new Error(`Network error: ${error.message}`);
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
      maxResults = 50
    } = options;

    console.log(`🔍 Searching for "${keyword}" in ${repository} across all branches...`);

    // Get all branches first
    const branches = await this.listBranches(repository);
    console.log(`📋 Found ${branches.length} branches to search`);

    const allResults = [];
    let searchCount = 0;

    for (const branch of branches) {
      if (searchCount >= maxResults) break;

      console.log(`🌿 Searching branch: ${branch.name}`);
      
      try {
        // Add delay to respect rate limits
        if (searchCount > 0) {
          await this.delay(this.rateLimitDelay);
        }

        const branchResults = await this.searchInBranch({
          keyword,
          repository,
          branch: branch.name,
          searchInFiles,
          searchInFilenames,
          fileExtensions,
          maxResults: maxResults - searchCount
        });

        allResults.push(...branchResults);
        searchCount += branchResults.length;

      } catch (error) {
        console.warn(`⚠️  Error searching branch ${branch.name}: ${error.message}`);
        continue;
      }
    }

    console.log(`✅ Search completed. Found ${allResults.length} total results.`);
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
      maxResults
    } = options;

    const results = [];
    
    try {
      // Search in file contents
      if (searchInFiles) {
        const fileResults = await this.searchFileContents({
          keyword,
          repository,
          branch,
          fileExtensions,
          maxResults: Math.floor(maxResults / 2)
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
          maxResults: Math.floor(maxResults / 2)
        });
        results.push(...nameResults);
      }

    } catch (error) {
      console.warn(`Error searching in branch ${branch}: ${error.message}`);
    }

    return results;
  }

  /**
   * Search in file contents using GitHub's code search API
   */
  async searchFileContents(options) {
    const { keyword, repository, branch, fileExtensions, maxResults } = options;
    
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
      });

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
      console.warn(`Error searching file contents: ${error.message}`);
      return [];
    }
  }

  /**
   * Search in filenames
   */
  async searchFilenames(options) {
    const { keyword, repository, branch, fileExtensions, maxResults } = options;
    
    try {
      // Get repository tree for the specific branch
      const url = `${this.apiBase}/repos/${repository}/git/trees/${branch}`;
      const tree = await this.makeRequest(url, { recursive: 1 });
      
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
      console.warn(`Error searching filenames in branch ${branch}: ${error.message}`);
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
   * Utility function to add delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 