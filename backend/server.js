
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, 'dist/browser')));

// --- GAME STATE ---
let gameState = {
  phase: 'lobby',
  players: [],
  deck: [],
  roundActive: false,
  winnerName: null
};

io.on('connection', (socket) => {
  console.log(`[CONNECT] ID: ${socket.id}`);

  // 1. Gửi trạng thái hiện tại ngay lập tức cho người mới
  socket.emit('SYNC_STATE', gameState);

  socket.on('JOIN_GAME', (payload) => {
    // Payload có thể là string (cũ) hoặc object { name, deviceId } (mới)
    const playerName = typeof payload === 'object' ? payload.name : payload;
    const deviceId = typeof payload === 'object' ? payload.deviceId : socket.id;

    console.log(`[JOIN_REQ] Name: ${playerName}, Device: ${deviceId}, Socket: ${socket.id}`);
    
    // Kiểm tra xem ID thiết bị này đã có chưa
    const existingPlayerIndex = gameState.players.findIndex(p => p.id === deviceId);
    
    if (existingPlayerIndex !== -1) {
      // --- RECONNECT ---
      console.log(`[RECONNECT] Player ${playerName} reconnected.`);
      const p = gameState.players[existingPlayerIndex];
      p.socketId = socket.id; // Cập nhật socket mới
      p.connected = true;
      p.name = playerName; // Update tên nếu cần
    } else {
      // --- NEW JOIN ---
      const isFirst = gameState.players.length === 0;
      
      const newPlayer = {
        id: deviceId, // Sử dụng Device ID làm ID chính
        socketId: socket.id,
        name: playerName,
        score: 0,
        hand: [],
        isHost: isFirst,
        connected: true
      };

      gameState.players.push(newPlayer);
      
      // Reset game nếu là người đầu tiên tạo phòng mới
      if (isFirst) {
        gameState.phase = 'lobby';
        gameState.deck = [];
        gameState.roundActive = false;
        gameState.winnerName = null;
      }
    }

    console.log(`[STATE_UPDATE] Players count: ${gameState.players.length}`);
    io.emit('SYNC_STATE', gameState);
  });

  socket.on('UPDATE_STATE', (newState) => {
    // Merge trạng thái kết nối từ server vào state mới từ client (để tránh client ghi đè status)
    newState.players.forEach(p => {
        const serverP = gameState.players.find(sp => sp.id === p.id);
        if (serverP) {
            p.connected = serverP.connected;
            p.socketId = serverP.socketId;
        }
    });

    gameState = newState;
    socket.broadcast.emit('SYNC_STATE', gameState);
  });

  socket.on('RESET_GAME', () => {
    console.log('[RESET_GAME]');
    gameState = {
      phase: 'lobby',
      players: [],
      deck: [],
      roundActive: false,
      winnerName: null
    };
    io.emit('RESET_GAME');
    io.emit('SYNC_STATE', gameState);
  });

  socket.on('LEAVE_GAME', () => {
      console.log(`[LEAVE_GAME] Socket: ${socket.id}`);
      removePlayerBySocketId(socket.id);
  });

  socket.on('disconnect', () => {
    console.log(`[DISCONNECT] Socket: ${socket.id}`);
    const player = gameState.players.find(p => p.socketId === socket.id);
    
    if (player) {
      player.connected = false;
      console.log(`[PLAYER_DISCONNECT] ${player.name} marked as disconnected.`);
      io.emit('SYNC_STATE', gameState);
      // KHÔNG xóa player khỏi mảng nữa, để họ có thể reconnect
    }
  });

  function removePlayerBySocketId(sid) {
    const index = gameState.players.findIndex(p => p.socketId === sid);
    if (index !== -1) {
        const wasHost = gameState.players[index].isHost;
        gameState.players.splice(index, 1);

        // Chuyển Host nếu cần
        if (wasHost && gameState.players.length > 0) {
            gameState.players[0].isHost = true;
        }

        // Reset nếu phòng trống
        if (gameState.players.length === 0) {
            gameState.phase = 'lobby';
            gameState.deck = [];
            gameState.roundActive = false;
            gameState.winnerName = null;
        }
        io.emit('SYNC_STATE', gameState);
    }
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`--------------------------------------------------`);
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`--------------------------------------------------`);
});
