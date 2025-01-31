const { stopServer } = require('./server');

module.exports = async () => {
  console.log('Global Teardown: Stopping server...');
  await stopServer();
};
