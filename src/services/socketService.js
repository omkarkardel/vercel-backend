let io;

const connectedUsers = new Map();

const initializeSocketServer = (server) => {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    socket.on("register-user", ({ userId, role }) => {
      if (!userId) return;

      connectedUsers.set(String(userId), socket.id);

      if (role) {
        socket.join(`role:${role}`);
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
    });
  });
};

const emitToUser = (userId, payload) => {
  if (!io) return;
  const socketId = connectedUsers.get(String(userId));
  if (socketId) io.to(socketId).emit("notification", payload);
};

const emitToRole = (role, payload) => {
  if (!io) return;
  io.to(`role:${role}`).emit("notification", payload);
};

const emitToAll = (payload) => {
  if (!io) return;
  io.emit("notification", payload);
};

module.exports = initializeSocketServer;
module.exports.emitToUser = emitToUser;
module.exports.emitToRole = emitToRole;
module.exports.emitToAll = emitToAll;