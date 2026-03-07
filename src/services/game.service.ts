
import { Injectable, signal, computed, effect } from '@angular/core';
import { io, Socket } from 'socket.io-client';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  suitValue: number;
  id: string;
}

export interface Player {
  id: string; 
  name: string;
  score: number;
  hand: Card[];
  orderCard?: Card;
  initialOrderCard?: Card; // New: Persist the card used for ordering
  isHost: boolean;
  connected?: boolean;
  socketId?: string;
}

export type GamePhase = 'setup' | 'lobby' | 'order' | 'playing';

export interface GameState {
  phase: GamePhase;
  players: Player[];
  deck: Card[];
  roundActive: boolean;
  winnerName: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  // --- Local State ---
  deviceId = signal<string>('');
  myId = signal<string>(''); 
  myName = signal<string>('');
  
  // --- Shared Game State ---
  phase = signal<GamePhase>('setup');
  players = signal<Player[]>([]);
  deck = signal<Card[]>([]);
  isRoundActive = signal<boolean>(false);
  winnerName = signal<string | null>(null);

  // --- Computed ---
  me = computed(() => this.players().find(p => p.id === this.myId()));
  isHost = computed(() => this.me()?.isHost ?? false);
  otherPlayers = computed(() => this.players().filter(p => p.id !== this.myId()));

  private socket: Socket;
  
  constructor() {
    // 1. Init Socket
    const hostname = window.location.hostname;
    const SERVER_URL = `http://${hostname}:3000`;
    
    console.log('INIT SERVICE: Connecting to', SERVER_URL);
    
    this.socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    // 2. Init Device ID (Persistent ID)
    let storedDeviceId = localStorage.getItem('DEVICE_ID');
    if (!storedDeviceId) {
        // Simple UUID fallback
        storedDeviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('DEVICE_ID', storedDeviceId);
    }
    this.deviceId.set(storedDeviceId);
    this.myId.set(storedDeviceId);

    // 3. Check LocalStorage for Name
    const savedName = localStorage.getItem('PLAYER_NAME');
    if (savedName) {
        this.myName.set(savedName);
    }

    // --- Socket Listeners ---

    this.socket.on('connect', () => {
      console.log('✅ SOCKET CONNECTED. ID:', this.socket.id);
      // Do NOT overwrite myId with socket.id anymore.
      
      // Auto-rejoin if we have a name
      if (this.myName()) {
          console.log('🔄 Auto-rejoining as', this.myName());
          this.joinGame(this.myName());
      }
    });

    this.socket.on('disconnect', () => {
        console.warn('⚠️ Socket Disconnected');
    });

    this.socket.on('SYNC_STATE', (state: GameState) => {
      console.log('📦 RECEIVED STATE. Players:', state.players.length);
      this.syncState(state);
      
      // Auto-fix: If I have a name, but Server says I'm not in the list (and it's Lobby), try to join again.
      if (this.myName() && state.phase === 'lobby') {
          const amIInList = state.players.some(p => p.id === this.myId());
          if (!amIInList && this.socket.connected) {
             console.log('⚠️ Detect Ghost State (Name set but not in list). Re-joining...');
             this.joinGame(this.myName());
          }
      }
    });

    this.socket.on('RESET_GAME', () => {
      this.resetLocalState();
    });
  }

  joinGame(name: string) {
    console.log('👉 ACTION: Join Game as:', name);
    localStorage.setItem('PLAYER_NAME', name);
    this.myName.set(name);
    if (this.socket.connected) {
      this.socket.emit('JOIN_GAME', { name, deviceId: this.deviceId() });
    } else {
      console.warn('Socket not connected yet, waiting...');
    }
  }

  leaveGame() {
    this.socket.emit('LEAVE_GAME');
    localStorage.removeItem('PLAYER_NAME');
    this.myName.set('');
    // Reload trang để xóa sạch socket state
    window.location.reload();
  }

  // --- Host Actions ---

  private broadcastState() {
    if (!this.isHost()) return;
    const state: GameState = {
      phase: this.phase(),
      players: this.players(),
      deck: this.deck(),
      roundActive: this.isRoundActive(),
      winnerName: this.winnerName()
    };
    this.socket.emit('UPDATE_STATE', state);
  }

  startGame() {
    if (!this.isHost()) return;
    this.dealOrderCards();
    this.phase.set('order');
    this.broadcastState();
  }

  updateScore(playerId: string, amount: number) {
    if (!this.isHost()) return;
    this.players.update(prev => prev.map(p => 
      p.id === playerId ? { ...p, score: p.score + amount } : p
    ));
    this.broadcastState();
  }

  private createDeck() {
    // UPDATED SUIT ORDER: Diamond (Rô) > Heart (Cơ) > Club (Tép) > Spade (Bích)
    const suits: Suit[] = ['spades', 'clubs', 'hearts', 'diamonds'];
    
    // UPDATED RANK ORDER: Ace (Lowest) -> 2...10 -> J -> Q -> King (Highest)
    const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    const newDeck: Card[] = [];
    
    suits.forEach((suit, suitIndex) => {
      // suitIndex: 0(spades) ... 3(diamonds) -> Value: 1..4
      const suitValue = suitIndex + 1; 

      ranks.forEach((rank, rankIndex) => {
        newDeck.push({
          suit, 
          rank, 
          // rankIndex 0 is Ace (Value 1), rankIndex 12 is King (Value 13)
          value: rankIndex + 1, 
          suitValue,
          id: `${rank}-${suit}-${Math.random()}`
        });
      });
    });
    return newDeck;
  }

  private shuffle(deck: Card[]) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  dealOrderCards() {
    if (!this.isHost()) return;
    let deck = this.shuffle(this.createDeck());
    const players = [...this.players()];
    
    // Clear old data
    players.forEach(p => {
        p.orderCard = deck.pop();
        p.initialOrderCard = undefined; 
    });

    this.deck.set(deck);
    this.players.set(players);
    this.broadcastState();
  }

  finalizeOrder() {
    if (!this.isHost()) return;
    const sortedPlayers = [...this.players()].sort((a, b) => {
      if (!a.orderCard || !b.orderCard) return 0;
      // 1. Compare Rank Value (Higher value = Higher priority)
      // With new deck: K(13) > ... > A(1)
      if (a.orderCard.value !== b.orderCard.value) return b.orderCard.value - a.orderCard.value;
      // 2. Compare Suit Value (Diamond > Heart > Club > Spade)
      return b.orderCard.suitValue - a.orderCard.suitValue;
    });

    // Store the card in initialOrderCard before clearing orderCard
    sortedPlayers.forEach(p => {
        p.initialOrderCard = p.orderCard;
        p.orderCard = undefined;
    });

    this.players.set(sortedPlayers);
    this.phase.set('playing');
    this.broadcastState();
  }

  // Clears the table and winner, but DOES NOT deal cards yet.
  resetRound() {
    if (!this.isHost()) return;
    
    // Clear hands
    const players = this.players().map(p => ({...p, hand: []}));
    
    this.players.set(players);
    this.winnerName.set(null);
    this.isRoundActive.set(false);
    this.broadcastState();
  }

  // Shuffles and deals cards
  startNewRound() {
    if (!this.isHost()) return;
    let deck = this.shuffle(this.createDeck());
    
    // Create deep copies to ensure clean state update
    const players = this.players().map(p => ({...p, hand: []}));
    
    // Deal cards (2 cards per player)
    for (let i = 0; i < 2; i++) {
      players.forEach(p => { 
          if (deck.length > 0) {
              p.hand.push(deck.pop()!);
          }
      });
    }

    this.deck.set(deck);
    this.players.set(players);
    this.isRoundActive.set(true);
    this.winnerName.set(null);
    this.broadcastState();
  }

  awardWinner(playerId: string, playerName: string) {
    if (!this.isHost()) return;
    this.players.update(prev => prev.map(p => p.id === playerId ? { ...p, score: p.score + 1 } : p));
    this.isRoundActive.set(false);
    this.winnerName.set(playerName);
    this.broadcastState();
  }

  clearGameData() {
    localStorage.removeItem('PLAYER_NAME');
    this.socket.emit('RESET_GAME');
  }

  private syncState(state: GameState) {
    this.phase.set(state.phase);
    this.players.set([...state.players]); 
    this.deck.set([...state.deck]);
    this.isRoundActive.set(state.roundActive);
    this.winnerName.set(state.winnerName);
  }

  private resetLocalState() {
    localStorage.removeItem('PLAYER_NAME');
    this.myName.set('');
    this.phase.set('setup');
    this.players.set([]);
    this.deck.set([]);
    this.isRoundActive.set(false);
    this.winnerName.set(null);
  }
}
