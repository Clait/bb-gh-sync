const { app } = require('./index');
const http = require('http');

let server;
const connections = new Set();

const startServer = () => {
  return new Promise((resolve, reject) => {
    console.log('Starting server...');
    server = http.createServer(app).listen((err) => {
      if (err) {
        console.error('Error starting server:', err);
        return reject(err);
      }
      console.log(`Server started on port ${server.address().port}`);
      resolve(server);
    });

    server.on('connection', (conn) => {
      connections.add(conn);
      console.log('Connection added:', connections.size);
      conn.on('close', () => {
        connections.delete(conn);
        console.log('Connection closed:', connections.size);
      });
    });
  });
};

const stopServer = () => {
  return new Promise((resolve, reject) => {
    console.log('Stopping server...');
    for (const conn of connections) {
      conn.destroy();
      console.log('Connection destroyed:', connections.size);
    }

    if (server && server.listening) {
      server.close((err) => {
        if (err) {
          console.error('Error closing server:', err);
          return reject(err);
        }
        console.log('Server stopped');
        resolve();
      });
    } else {
      console.log('Server not running');
      resolve();
    }
  });
};

process.on('exit', async () => {
  await stopServer();
});

module.exports = { startServer, stopServer };
