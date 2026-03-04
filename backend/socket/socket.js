let ioRef = null;

function attachSocket(io) {
  ioRef = io;
  io.on('connection', (socket) => {
    socket.emit('status', { connected: true, at: Date.now() });
  });
}

function broadcast(event, payload) {
  if (ioRef) ioRef.emit(event, payload);
}

module.exports = { attachSocket, broadcast };
