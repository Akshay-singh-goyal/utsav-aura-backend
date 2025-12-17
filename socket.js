// socket.js
const socketio = require('socket.io');
const Message = require('./Models/Message');
const Chat = require('./Models/Chat');

/**
 * Keeps a map of userId => socketId(s) if you want to track multiple devices
 * For simplicity we'll store socket.userId when client emits userStatus with their userId
 */
let io;
const userSockets = new Map();

function initSocket(server) {
  io = socketio(server, {
    cors: {
      origin: '*', // restrict in production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);

    // joinRoom: client sends chatId
    socket.on('joinRoom', (chatId) => {
      if (!chatId) return;
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined room ${chatId}`);
    });

    // userStatus: { online, userId }
    socket.on('userStatus', (payload) => {
      // payload may contain userId if available from client
      if (payload && payload.userId) {
        userSockets.set(payload.userId.toString(), socket.id);
        socket.userId = payload.userId.toString();
        socket.emit('statusAck', { ok: true });
      }
      // optionally broadcast user online presence
    });

    // sendMessage: expects { roomId, message }
    socket.on('sendMessage', async ({ roomId, message }) => {
      try {
        if (!roomId || !message) return;
        // Persist message if not persisted (frontend may send pre-built bot msg)
        // We check if message._id is temporary (like bot-...) or not
        if (!message._id || (typeof message._id === 'string' && message._id.startsWith('bot-'))) {
          // create and save
          const created = await Message.create({
            roomId,
            sender: message.sender,
            text: message.text,
            status: message.status || 'sent',
            meta: message.meta || {}
          });
          // update chat lastMessageAt
          await Chat.findByIdAndUpdate(roomId, { lastMessageAt: new Date() });

          // send to room
          io.to(roomId).emit('receiveMessage', created);
        } else {
          // assume message already saved by backend route; just forward it
          io.to(roomId).emit('receiveMessage', message);
        }
      } catch (err) {
        console.error('socket sendMessage error', err);
      }
    });

    // Admin emits chatClosed or chatContinued events from admin UI
    socket.on('chatClosed', async ({ chatId }) => {
      if (!chatId) return;
      await Chat.findByIdAndUpdate(chatId, { isClosed: true });
      io.to(chatId).emit('chatClosed', { chatId });
    });

    socket.on('chatContinued', async ({ chatId }) => {
      if (!chatId) return;
      await Chat.findByIdAndUpdate(chatId, { isClosed: false });
      io.to(chatId).emit('chatContinued', { chatId });
    });

    // Optional: message delivered / read receipts
    socket.on('messageDelivered', async ({ messageId }) => {
      if (!messageId) return;
      await Message.findByIdAndUpdate(messageId, { status: 'delivered' });
      // you might want to emit an update to the sender
    });

    socket.on('messageRead', async ({ messageId }) => {
      if (!messageId) return;
      await Message.findByIdAndUpdate(messageId, { status: 'read' });
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected', socket.id);
      if (socket.userId) userSockets.delete(socket.userId);
    });
  });

  console.log('Socket.io initialized');
}

module.exports = { initSocket, ioRef: () => io };
