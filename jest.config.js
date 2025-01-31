module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios)/'
  ],
  testTimeout: 30000,
  forceExit: true,
  globalTeardown: './jest.teardown.js' // Add globalTeardown
};
