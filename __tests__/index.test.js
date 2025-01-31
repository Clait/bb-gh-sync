const request = require('supertest');
const axios = require('axios');

jest.mock('axios');
jest.mock('simple-git', () => () => ({
  clone: jest.fn(),
  addRemote: jest.fn(),
  push: jest.fn()
}));

beforeEach(() => {
  axios.get = jest.fn(); // Ensure axios is mocked before each test
});

describe('Webhook Endpoint', () => {
  it('should return 200 when repos are synced', async () => {
    axios.get.mockResolvedValue({ status: 200 }); // Mock axios.get for success

    const response = await request(global.server)
      .post('/webhook')
      .send({ repository: { name: 'test-repo' }, push: {} });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Repositories synced');
  });

  it('should return 404 when GitHub repository is not found', async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } }); // Mock axios.get for 404 error

    const response = await request(global.server)
      .post('/webhook')
      .send({ repository: { name: 'test-repo' }, push: {} });

    expect(response.status).toBe(404);
    expect(response.text).toBe('GitHub repository not found');
  });

  it('should return 400 for invalid payload', async () => {
    const response = await request(global.server)
      .post('/webhook')
      .send({});

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid payload');
  });

  it('should return 500 for internal server errors', async () => {
    axios.get.mockImplementation(() => {
      throw new Error('Internal error'); // Mock axios.get for internal error
    });

    const response = await request(global.server)
      .post('/webhook')
      .send({ repository: { name: 'test-repo' }, push: {} });

    expect(response.status).toBe(500);
    expect(response.text).toBe('Internal server error');
  });
});
