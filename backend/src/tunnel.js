const { Client } = require('ssh2');
const net = require('net');

const LOCAL_PORT = Number(process.env.TUNNEL_LOCAL_PORT || 13306);
const REMOTE_HOST = process.env.TUNNEL_REMOTE_HOST || '127.0.0.1';
const REMOTE_PORT = Number(process.env.TUNNEL_REMOTE_PORT || 3306);
const STARTUP_TIMEOUT = 30000;

let current = null;
let sshClient = null;
let ready = false;
let retryDelay = 2000;
let retryTimer = null;
let resolveFirst;
const firstReady = new Promise((r) => { resolveFirst = r; });

function scheduleReconnect() {
  ready = false;
  if (retryTimer) return;
  const delay = retryDelay;
  retryDelay = Math.min(retryDelay * 2, 30000);
  console.warn(`[tunnel] nouvelle tentative dans ${delay / 1000}s`);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    connectSSH();
  }, delay);
}

function connectSSH() {
  const conn = new Client();
  current = conn;

  conn.on('ready', () => {
    if (conn !== current) return;
    console.log('[tunnel] SSH connecté');
    sshClient = conn;
    ready = true;
    retryDelay = 2000;
    resolveFirst();
  });

  conn.on('error', (err) => {
    if (conn !== current) return;
    console.error('[tunnel] erreur SSH:', err.message);
    scheduleReconnect();
  });

  conn.on('close', () => {
    if (conn !== current) return;
    console.warn('[tunnel] SSH fermé');
    sshClient = null;
    scheduleReconnect();
  });

  conn.connect({
    host: process.env.SSH_HOST,
    port: Number(process.env.SSH_PORT || 22),
    username: process.env.SSH_USER,
    password: process.env.SSH_PASSWORD,
    keepaliveInterval: 10000,
    keepaliveCountMax: 3,
    readyTimeout: 20000,
  });
}

async function startTunnel() {
  const server = net.createServer((socket) => {
    socket.on('error', () => {});
    if (!ready || !sshClient) return socket.destroy();

    sshClient.forwardOut('127.0.0.1', 0, REMOTE_HOST, REMOTE_PORT, (err, stream) => {
      if (err) {
        console.error('[tunnel] forwardOut:', err.message);
        return socket.destroy();
      }
      socket.pipe(stream).pipe(socket);
      stream.on('error', () => socket.destroy());
      socket.on('close', () => stream.destroy());
      stream.on('close', () => socket.destroy());
    });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(LOCAL_PORT, '127.0.0.1', resolve);
  });
  console.log(`[tunnel] écoute sur 127.0.0.1:${LOCAL_PORT}`);

  connectSSH();
  await Promise.race([firstReady, new Promise((r) => setTimeout(r, STARTUP_TIMEOUT))]);
  if (!ready) console.warn('[tunnel] pas encore connecté, le serveur démarre quand même');
}

module.exports = { startTunnel };