// Load the required modules
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const simpleGit = require('simple-git');
require('dotenv').config(); // Load environment variables from .env file

// Initialize the app
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Webhook endpoint to handle Bitbucket webhooks
app.post('/webhook', async (req, res) => {
  // Extract necessary data from the webhook payload
  const { repository } = req.body;

  if (!repository) {
    return res.status(400).send('Invalid payload');
  }

  const repoName = repository.name;

  try {
    // Check if the corresponding repo exists on GitHub
    const ghRepoExists = await checkGitHubRepoExists(repoName);

    if (ghRepoExists) {
      // Sync the GitHub repo with Bitbucket
      await syncRepos(repoName);
      res.status(200).send('Repositories synced');
    } else {
      res.status(404).send('GitHub repository not found');
    }
  } catch (error) {
    console.error('Error syncing repositories:', error);
    res.status(500).send('Internal server error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Function to check if a GitHub repo exists
async function checkGitHubRepoExists(repoName) {
    // Load GitHub username and token from environment variables
    const ghUser = process.env.GITHUB_USER;
    const ghToken = process.env.GITHUB_TOKEN;
    // GitHub API URL for the specified repository
    const ghApiUrl = `https://api.github.com/repos/${ghUser}/${repoName}`;
  
    try {
      // Make a GET request to the GitHub API to check if the repository exists
      const response = await axios.get(ghApiUrl, {
        headers: {
          Authorization: `token ${ghToken}`
        }
      });
      // Return true if the repository exists (status code 200)
      return response.status === 200;
    } catch (error) {
      // Return false if the repository does not exist or an error occurs
      return false;
    }
  }
  
  // Function to sync Bitbucket and GitHub repos
  async function syncRepos(repoName) {
    // Load Bitbucket and GitHub repository URLs from environment variables
    const bbUrl = process.env.BITBUCKET_REPO_URL;
    const ghUrl = process.env.GITHUB_REPO_URL;
  
    const git = simpleGit();
  
    // Clone the Bitbucket repository to a temporary directory
    await git.clone(bbUrl, `./temp/${repoName}`);
  
    // Add the GitHub repository as a remote
    await git.addRemote('github', ghUrl);
  
    // Push changes from Bitbucket to GitHub
    await git.push('github', 'master');
  }
  
  // Export the functions for testing purposes
  module.exports = { checkGitHubRepoExists, syncRepos };
  