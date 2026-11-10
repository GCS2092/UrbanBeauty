require('dotenv').config();
const { startTunnel } = require('./src/tunnel');

(async () => {
  if (process.env.SSH_HOST) {
    await startTunnel();
  }
  require('./server');
})();