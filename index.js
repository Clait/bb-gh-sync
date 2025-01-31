const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const simpleGit = require('simple-git');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  const { repository } = req.body;

  if (!repository) {
    return res.status(400).send('Invalid payload');
  }

  const repoName = repository.name;

  try {
    const ghRepoExists = await checkGitHubRepoExists(repoName);

    if (ghRepoExists) {
      await syncRepos(repoName);
      res.status(200).send('Repositories synced');
    } else {
      res.status(404).send('GitHub repository not found');
    }
  } catch (error) {
    if (error.message === 'GitHub repository not found') {
      res.status(404).send('GitHub repository not found');
    } else {
      console.error('Error syncing repositories:', error);
      res.status(500).send('Internal server error');
    }
  }
});

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
    if (error.response && error.response.status === 404) {
      throw new Error('GitHub repository not found');
    } else {
      throw new Error('GitHub repo check failed');
    }
  }
}

async function syncRepos(repoName) {
  const bbUrl = process.env.BITBUCKET_REPO_URL;
  const ghUrl = process.env.GITHUB_REPO_URL;

  const git = simpleGit();
  await git.clone(bbUrl, `./temp/${repoName}`);
  await git.addRemote('github', ghUrl);
  await git.push('github', 'master');
}

let shuttingDown = false;

const shutdown = async () => {
  if (!shuttingDown) {
    shuttingDown = true;
    console.log('Shutting down server...');
    await new Promise((resolve) => server.close(resolve));
    console.log('Server shut down');
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = { app, checkGitHubRepoExists, syncRepos };

if (require.main === module) {
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
