
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

  // 2. Xử lý Join
  socket.on('JOIN_GAME', (playerName) => {
    console.log(`[JOIN_REQ] Name: ${playerName}, Socket: ${socket.id}`);
    
    // Kiểm tra xem ID này đã có chưa
    const existingPlayerIndex = gameState.players.findIndex(p => p.id === socket.id);
    
    if (existingPlayerIndex === -1) {
      // Logic xác định Host: Nếu chưa có ai, hoặc người duy nhất vừa thoát
      const isFirst = gameState.players.length === 0;
      
      const newPlayer = {
        id: socket.id,
        name: playerName,
        score: 0,
        hand: [],
        isHost: isFirst
      };

      gameState.players.push(newPlayer);
      
      // Reset game nếu là người đầu tiên tạo phòng mới
      if (isFirst) {
        gameState.phase = 'lobby';
        gameState.deck = [];
        gameState.roundActive = false;
        gameState.winnerName = null;
      }
    } else {
        // Update tên nếu đã tồn tại (trường hợp rejoin)
        gameState.players[existingPlayerIndex].name = playerName;
    }

    console.log(`[STATE_UPDATE] Players count: ${gameState.players.length}`);
    io.emit('SYNC_STATE', gameState);
  });

  socket.on('UPDATE_STATE', (newState) => {
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

  socket.on('disconnect', () => {
    console.log(`[DISCONNECT] ID: ${socket.id}`);
    const leaverIndex = gameState.players.findIndex(p => p.id === socket.id);
    
    if (leaverIndex !== -1) {
      const wasHost = gameState.players[leaverIndex].isHost;
      gameState.players.splice(leaverIndex, 1);

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

      console.log(`[PLAYER_LEFT] Remaining: ${gameState.players.length}`);
      io.emit('SYNC_STATE', gameState);
    }
  });
});

// ===== API =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// ===== Serve Angular =====
const clientPath = path.join(__dirname, '../dist');
app.use(express.static(clientPath));

app.get('/*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`--------------------------------------------------`);
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`--------------------------------------------------`);
});
