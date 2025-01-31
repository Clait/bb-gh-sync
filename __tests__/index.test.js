// Load required modules for testing
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { checkGitHubRepoExists, syncRepos } = require('../index');

// Mock the axios module to simulate GitHub API responses
jest.mock('axios');

// Mock the simple-git module to simulate git operations
jest.mock('simple-git', () => () => ({
  clone: jest.fn(),
  addRemote: jest.fn(),
  push: jest.fn()
}));

// Initialize the Express app for testing
const app = express();
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
    res.status(500).send('Internal server error');
  }
});

// Test suite for the webhook endpoint
describe('Webhook Endpoint', () => {
  // Test case: Repositories are synced successfully
  it('should return 200 when repos are synced', async () => {
    // Mock the GitHub API response to simulate a successful check
    axios.get.mockResolvedValue({ status: 200 });

    // Send a POST request to the webhook endpoint
    const response = await request(app)
      .post('/webhook')
      .send({ repository: { name: 'test-repo' }, push: {} });

    // Assert that the response status is 200 and the response text is correct
    expect(response.status).toBe(200);
    expect(response.text).toBe('Repositories synced');
  });

  // Test case: GitHub repository is not found
  it('should return 404 when GitHub repository is not found', async () => {
    // Mock the GitHub API response to simulate a repository not found
    axios.get.mockRejectedValue({ response: { status: 404 } });

    // Send a POST request to the webhook endpoint
    const response = await request(app)
      .post('/webhook')
      .send({ repository: { name: 'test-repo' }, push: {} });

    // Assert that the response status is 404 and the response text is correct
    expect(response.status).toBe(404);
    expect(response.text).toBe('GitHub repository not found');
  });

  // Test case: Invalid payload
  it('should return 400 for invalid payload', async () => {
    // Send a POST request with an invalid payload
    const response = await request(app)
      .post('/webhook')
      .send({});

    // Assert that the response status is 400 and the response text is correct
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid payload');
  });

  // Test case: Internal server error
  it('should return 500 for internal server errors', async () => {
    // Mock the GitHub API response to simulate an internal error
    axios.get.mockImplementation(() => {
      throw new Error('Internal error');
    });

    // Send a POST request to the webhook endpoint
    const response = await request(app)
      .post('/webhook')
      .send({ repository: { name: 'test-repo' }, push: {} });

    // Assert that the response status is 500 and the response text is correct
    expect(response.status).toBe(500);
    expect(response.text).toBe('Internal server error');
  });
});
