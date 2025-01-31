const request = require('supertest');
const { app, checkGitHubRepoExists, syncRepos } = require('../index');
const axios = require('axios');

jest.mock('axios');
jest.mock('simple-git', () => () => ({
  clone: jest.fn(),
  addRemote: jest.fn(),
  push: jest.fn()
}));

let server;

beforeEach((done) => {
  server = app.listen(() => {
    done();
  });
});

afterEach((done) => {
  server.close(done);
});

describe('Webhook Endpoint', () => {
  it('should return 200 when repos are synced', async () => {
    axios.get = jest.fn().mockResolvedValue({ status: 200 }); // Explicitly mock axios.get

    const response = await request(server)
      .post('/webhook')
      .send({ repository: { name: 'test-repo' }, push: {} });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Repositories synced');
  });

  it('should return 404 when GitHub repository is not found', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 404 } }); // Explicitly mock axios.get

    const response = await request(server)
      .post('/webhook')
      .send({ repository: { name: 'test-repo' }, push: {} });

    expect(response.status).toBe(404);
    expect(response.text).toBe('GitHub repository not found');
  });

  it('should return 400 for invalid payload', async () => {
    const response = await request(server)
      .post('/webhook')
      .send({});

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid payload');
  });

  it('should return 500 for internal server errors', async () => {
    axios.get = jest.fn().mockImplementation(() => { // Explicitly mock axios.get
      throw new Error('Internal error');
    });

    const response = await request(server)
      .post('/webhook')
      .send({ repository: { name: 'test-repo' }, push: {} });

    expect(response.status).toBe(500);
    expect(response.text).toBe('Internal server error');
  });
});
