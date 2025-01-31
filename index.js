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

// Function to check if a GitHub repo exists
async function checkGitHubRepoExists(repoName) {
  const ghUser = process.env.GITHUB_USER;
  const ghToken = process.env.GITHUB_TOKEN;
  const ghApiUrl = `https://api.github.com/repos/${ghUser}/${repoName}`;

  try {
    const response = await axios.get(ghApiUrl, {
      headers: {
        Authorization: `token ${ghToken}`
      }
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Function to sync Bitbucket and GitHub repos
async function syncRepos(repoName) {
  const bbUrl = process.env.BITBUCKET_REPO_URL;
  const ghUrl = process.env.GITHUB_REPO_URL;

  const git = simpleGit();
  await git.clone(bbUrl, `./temp/${repoName}`);
  await git.addRemote('github', ghUrl);
  await git.push('github', 'master');
}

module.exports = { app, checkGitHubRepoExists, syncRepos };

// Start the server if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
