// Global variables
let currentResults = [];
let isSearching = false;

// DOM Elements
const searchForm = document.getElementById('searchForm');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultsModal = document.getElementById('resultsModal');
const errorToast = document.getElementById('errorToast');
const successToast = document.getElementById('successToast');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    console.log('GitHub Search MCP Web Interface loaded');
});

// Setup event listeners
function setupEventListeners() {
    // Search form submission
    searchForm.addEventListener('submit', handleSearch);
    
    // Close modal when clicking outside
    resultsModal.addEventListener('click', function(e) {
        if (e.target === resultsModal) {
            closeModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            hideToast();
        }
        if (e.ctrlKey && e.key === 'Enter') {
            if (!isSearching) {
                handleSearch(e);
            }
        }
    });
}

// Handle search form submission
async function handleSearch(e) {
    e.preventDefault();
    
    if (isSearching) {
        showError('Search already in progress. Please wait...');
        return;
    }
    
    const formData = new FormData(searchForm);
    const searchParams = {
        keyword: formData.get('keyword').trim(),
        repository: formData.get('repository').trim(),
        options: {
            searchInFiles: formData.get('searchInFiles') === 'on',
            searchInFilenames: formData.get('searchInFilenames') === 'on',
            maxResults: parseInt(formData.get('maxResults')) || 50,
            fileExtensions: parseFileExtensions(formData.get('fileExtensions'))
        }
    };
    
    // Validate input
    if (!searchParams.keyword) {
        showError('Please enter a search keyword');
        return;
    }
    
    if (!searchParams.repository) {
        showError('Please enter a repository (owner/repo)');
        return;
    }
    
    if (!isValidRepository(searchParams.repository)) {
        showError('Repository format should be "owner/repository" (e.g., "microsoft/vscode")');
        return;
    }
    
    if (!searchParams.options.searchInFiles && !searchParams.options.searchInFilenames) {
        showError('Please select at least one search option (files or filenames)');
        return;
    }
    
    await performSearch(searchParams);
}

// Validate repository format
function isValidRepository(repo) {
    const repoPattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
    return repoPattern.test(repo);
}

// Parse file extensions from input
function parseFileExtensions(input) {
    if (!input || !input.trim()) return [];
    
    return input.split(',')
        .map(ext => ext.trim())
        .filter(ext => ext.length > 0)
        .map(ext => ext.startsWith('.') ? ext : '.' + ext);
}

// Perform the search
async function performSearch(searchParams) {
    isSearching = true;
    showLoading(true);
    hideToast();
    
    console.log('Starting search with params:', searchParams);
    
    try {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchParams)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}: Search request failed`);
        }
        
        if (!data.success) {
            throw new Error(data.error || 'Search failed');
        }
        
        currentResults = data.results || [];
        displayResults(data);
        
        if (currentResults.length === 0) {
            showSuccess(`No results found for "${searchParams.keyword}" in ${searchParams.repository}`);
        } else {
            showSuccess(`Found ${currentResults.length} results for "${searchParams.keyword}"`);
            openModal();
        }
        
    } catch (error) {
        console.error('Search error:', error);
        showError(error.message || 'Search failed. Please try again.');
    } finally {
        isSearching = false;
        showLoading(false);
    }
}

// Display search results in modal
function displayResults(data) {
    const { results, summary } = data;
    
    // Update modal title
    document.getElementById('resultsTitle').innerHTML = 
        `<i class="fas fa-search-plus"></i> Search Results for "${summary.keyword}"`;
    
    // Update search summary
    const summaryElement = document.getElementById('searchSummary');
    summaryElement.innerHTML = `
        <h3><i class="fas fa-chart-bar"></i> Search Summary</h3>
        <p><strong>Repository:</strong> ${summary.repository}</p>
        <p><strong>Keyword:</strong> "${summary.keyword}"</p>
        <div class="stats">
            <div class="stat-item">
                <div class="stat-value">${summary.totalResults}</div>
                <div class="stat-label">Total Results</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${getUniqueBranches(results).length}</div>
                <div class="stat-label">Branches</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${getUniqueFiles(results).length}</div>
                <div class="stat-label">Files</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${getMatchTypes(results).join(', ')}</div>
                <div class="stat-label">Match Types</div>
            </div>
        </div>
    `;
    
    // Update results container
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="text-center mt-20">
                <i class="fas fa-search" style="font-size: 48px; color: #d1d5db; margin-bottom: 16px;"></i>
                <h3 style="color: #6b7280; margin-bottom: 8px;">No Results Found</h3>
                <p style="color: #9ca3af;">Try adjusting your search criteria or check the repository name.</p>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = `
        <div class="results-container">
            ${results.map((result, index) => createResultItem(result, index)).join('')}
        </div>
    `;
}

// Create HTML for a single result item
function createResultItem(result, index) {
    const iconMap = {
        'content': 'fas fa-file-code',
        'filename': 'fas fa-file',
        'default': 'fas fa-search'
    };
    
    const icon = iconMap[result.matchType] || iconMap.default;
    
    return `
        <div class="result-item">
            <div class="result-header">
                <div class="result-title">
                    <i class="${icon}"></i>
                    ${result.filePath}
                </div>
                <div class="result-meta">
                    <div class="meta-item">
                        <i class="fas fa-code-branch"></i>
                        ${result.branch}
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-tag"></i>
                        ${result.matchType}
                    </div>
                    ${result.lineNumber ? `
                        <div class="meta-item">
                            <i class="fas fa-hashtag"></i>
                            Line ${result.lineNumber}
                        </div>
                    ` : ''}
                    ${result.score ? `
                        <div class="meta-item">
                            <i class="fas fa-star"></i>
                            Score: ${result.score}
                        </div>
                    ` : ''}
                </div>
            </div>
            
            ${result.context ? `
                <div class="result-content">
                    <code>${escapeHtml(result.context)}</code>
                </div>
            ` : ''}
            
            <div class="result-actions">
                ${result.url ? `
                    <a href="${result.url}" target="_blank" class="action-link">
                        <i class="fas fa-external-link-alt"></i>
                        View on GitHub
                    </a>
                ` : ''}
                <button class="action-link" onclick="copyToClipboard('${escapeHtml(result.filePath)}')">
                    <i class="fas fa-copy"></i>
                    Copy Path
                </button>
            </div>
        </div>
    `;
}

// Utility functions for result analysis
function getUniqueBranches(results) {
    return [...new Set(results.map(r => r.branch))];
}

function getUniqueFiles(results) {
    return [...new Set(results.map(r => r.filePath))];
}

function getMatchTypes(results) {
    return [...new Set(results.map(r => r.matchType))];
}

// Modal functions
function openModal() {
    resultsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    resultsModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Loading functions
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

// Toast notification functions
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    errorToast.classList.remove('hidden');
    setTimeout(hideToast, 5000);
}

function showSuccess(message) {
    document.getElementById('successMessage').textContent = message;
    successToast.classList.remove('hidden');
    setTimeout(hideToast, 3000);
}

function hideToast() {
    errorToast.classList.add('hidden');
    successToast.classList.add('hidden');
}

// Quick action functions
function fillExample(keyword, repository) {
    document.getElementById('keyword').value = keyword;
    document.getElementById('repository').value = repository;
    document.getElementById('keyword').focus();
}

function clearForm() {
    searchForm.reset();
    document.getElementById('searchInFiles').checked = true;
    document.getElementById('searchInFilenames').checked = true;
    document.getElementById('maxResults').value = '50';
    document.getElementById('keyword').focus();
}

// Export results function
function exportResults() {
    if (currentResults.length === 0) {
        showError('No results to export');
        return;
    }
    
    try {
        const exportData = {
            timestamp: new Date().toISOString(),
            searchParams: {
                keyword: document.getElementById('keyword').value,
                repository: document.getElementById('repository').value
            },
            results: currentResults
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `github-search-results-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccess('Results exported successfully');
    } catch (error) {
        console.error('Export error:', error);
        showError('Failed to export results');
    }
}

// Copy to clipboard function
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showSuccess('Copied to clipboard');
    } catch (error) {
        console.error('Copy error:', error);
        showError('Failed to copy to clipboard');
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Enhanced error handling for network issues
window.addEventListener('offline', function() {
    showError('You are offline. Please check your internet connection.');
});

window.addEventListener('online', function() {
    showSuccess('Connection restored');
});

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Future: Register service worker for offline functionality
        console.log('Service Worker support detected');
    });
} 