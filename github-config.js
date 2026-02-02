// GitHub API Configuration
const GITHUB_CONFIG = {
    owner: 'bigunbimsara',
    repo: 'Fairyscript_-_subtitles',
    branch: 'main',
    token: 'YOUR_GITHUB_TOKEN_HERE', // Replace with your GitHub Personal Access Token
    subtitlesPath: 'subtitles',
    imagesPath: 'subtitles/images'
};

// GitHub API Helper Functions
const GitHubAPI = {
    // Upload file to GitHub
    async uploadFile(path, content, message) {
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                content: content,
                branch: GITHUB_CONFIG.branch
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to upload to GitHub');
        }
        
        return await response.json();
    },
    
    // Get raw file URL
    getRawUrl(path) {
        return `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${path}`;
    },
    
    // Delete file from GitHub
    async deleteFile(path, message) {
        // First get the file SHA
        const getUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`;
        
        const getResponse = await fetch(getUrl, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
            }
        });
        
        if (!getResponse.ok) {
            throw new Error('File not found');
        }
        
        const fileData = await getResponse.json();
        
        // Now delete the file
        const deleteUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`;
        
        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                sha: fileData.sha,
                branch: GITHUB_CONFIG.branch
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete from GitHub');
        }
        
        return await response.json();
    }
};

console.log('GitHub API configuration loaded');
