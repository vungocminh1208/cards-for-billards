
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-lobby-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      <div class="bg-gray-800 p-4 md:p-8 rounded-xl shadow-2xl border border-gray-700 text-center">
        <div class="flex justify-between items-center mb-6">
           <h2 class="text-xl font-bold text-green-400">Phòng Chờ</h2>
           <span class="font-mono bg-gray-700 px-3 py-1 rounded text-white text-sm">ROOM: TEST</span>
        </div>
        
        @if (gameService.isHost()) {
           <p class="text-[10px] text-gray-400 mb-2 text-right">Cập nhật điểm khởi tạo:</p>
        }

        <div class="flex flex-col gap-3 mb-6 max-h-[60vh] overflow-y-auto custom-scroll pr-1">
          @for (player of gameService.players(); track player.id) {
             <div class="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-700 p-3 rounded-lg border border-gray-600 animate-pulse-once gap-3">
                
                <!-- Player Info -->
                <div class="flex items-center gap-3 flex-grow">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                     [class.bg-yellow-500]="player.isHost"
                     [class.text-black]="player.isHost"
                     [class.bg-blue-600]="!player.isHost"
                  >
                    {{ player.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="text-left overflow-hidden">
                    <div class="font-bold text-white flex items-center gap-2 text-sm truncate">
                      {{ player.name }}
                      @if (player.id === gameService.myId()) {
                        <span class="text-[10px] bg-green-900 text-green-300 px-1.5 py-0.5 rounded">BẠN</span>
                      }
                      @if (player.isHost) {
                        <span class="text-lg" title="Chủ phòng">👑</span>
                      }
                    </div>
                    <div class="flex items-center gap-2">
                         <span class="text-[10px] text-gray-400">{{ player.isHost ? 'Chủ phòng' : 'Người chơi' }}</span>
                         <span class="text-xs font-mono text-yellow-400 font-bold border border-yellow-400/30 px-1 rounded bg-yellow-400/10">
                            {{ player.score }} pts
                         </span>
                    </div>
                  </div>
                </div>

                <!-- Host Controls (Only visible to Host in Lobby) -->
                @if (gameService.isHost()) {
                  <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button 
                        (click)="addScore(player.id, 0.5)"
                        class="bg-blue-800 hover:bg-blue-700 text-blue-200 text-[10px] font-bold px-2 py-1.5 rounded border border-blue-600 active:scale-95 transition-all"
                        title="Cộng 0.5 điểm"
                    >
                        +0.5
                    </button>
                    <button 
                        (click)="addScore(player.id, 1)"
                        class="bg-green-800 hover:bg-green-700 text-green-200 text-[10px] font-bold px-2 py-1.5 rounded border border-green-600 active:scale-95 transition-all"
                        title="Cộng 1 điểm"
                    >
                        +1.0
                    </button>
                    <!-- Small Reset for correction -->
                    <button 
                        (click)="addScore(player.id, -player.score)"
                        class="bg-gray-800 hover:bg-red-900 text-red-300 text-[10px] px-2 py-1.5 rounded border border-gray-600 active:scale-95 transition-all ml-1"
                        title="Reset điểm về 0"
                    >
                        ⟳
                    </button>
                  </div>
                }
             </div>
          }
          
          @if (gameService.players().length === 0) {
             <div class="flex flex-col items-center py-6 gap-3">
                <div class="text-gray-500 italic">Danh sách trống...</div>
                <button (click)="retryJoin()" class="bg-gray-700 hover:bg-gray-600 text-xs text-white px-3 py-2 rounded border border-gray-600">
                  🔄 Thử kết nối lại
                </button>
             </div>
          }
        </div>

        <div class="border-t border-gray-700 pt-4 sticky bottom-0 bg-gray-800 pb-2">
          @if (gameService.isHost()) {
            <button 
              (click)="start()"
              [disabled]="gameService.players().length < 2"
              class="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95"
            >
              Bắt Đầu Game ({{ gameService.players().length }}/10)
            </button>
            <p class="text-yellow-500/80 text-xs mt-2">Cần tối thiểu 2 người để chơi</p>
          } @else {
            @if (gameService.players().length > 0) {
                <div class="flex flex-col items-center gap-2 animate-pulse">
                <div class="w-6 h-6 border-2 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
                <p class="text-gray-400 text-sm">Chờ chủ phòng bắt đầu...</p>
                </div>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes pulse-once {
      0% { transform: scale(0.95); opacity: 0.5; }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-pulse-once {
      animation: pulse-once 0.3s ease-out;
    }
    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
  `]
})
export class LobbyViewComponent {
  gameService = inject(GameService);

  start() {
    this.gameService.startGame();
  }

  retryJoin() {
    if (this.gameService.myName()) {
        this.gameService.joinGame(this.gameService.myName());
    }
  }

  addScore(playerId: string, amount: number) {
    this.gameService.updateScore(playerId, amount);
  }
}
