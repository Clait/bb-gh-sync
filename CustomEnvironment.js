const NodeEnvironment = require('jest-environment-node');
const { app } = require('./index');

class CustomEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    this.global.server = app.listen();
  }

  async teardown() {
    await super.teardown();
    if (this.global.server) {
      await new Promise((resolve) => this.global.server.close(resolve));
    }
  }
}

module.exports = CustomEnvironment;
