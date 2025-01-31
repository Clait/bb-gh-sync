const { app } = require('./index');

module.exports = async () => {
  global.server = app.listen();
};
