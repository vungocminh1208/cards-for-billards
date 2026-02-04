
import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Player } from '../services/game.service';
import { PlayingCardComponent } from './playing-card.component';

@Component({
  selector: 'app-game-view',
  standalone: true,
  imports: [CommonModule, PlayingCardComponent],
  template: `
    <div class="w-full flex flex-col h-full relative overflow-hidden bg-gray-900">
      
      <!-- 1. OPPONENTS AREA (Top - Scrollable - Compact) -->
      <div class="flex-grow overflow-y-auto custom-scroll p-2 pb-60"> <!-- Increased bottom padding to avoid overlap with fixed footer -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          @for (player of otherPlayers(); track player.id) {
            <div class="bg-gray-800/60 rounded-lg p-2 border border-gray-700/50 relative flex flex-col min-h-[110px]">
              <!-- Player Header -->
              <div class="flex justify-between items-start mb-1 h-7">
                 <div class="flex flex-col overflow-hidden mr-1">
                    <span class="font-bold text-xs text-gray-200 truncate">{{ player.name }}</span>
                    <span class="text-[10px] text-yellow-500 font-mono leading-none">{{ player.score }} pts</span>
                 </div>
                 
                 <!-- Opponent Win Button -->
                 @if (gameService.isHost() && gameService.isRoundActive()) {
                    <button 
                      (click)="selectWinner(player)"
                      class="bg-gray-700 hover:bg-yellow-600 text-[10px] text-gray-300 hover:text-white px-2 py-0.5 rounded border border-gray-600 transition-colors shrink-0"
                    >
                      WIN
                    </button>
                 }
              </div>

              <!-- Opponent Cards (Small) -->
              <div class="flex-grow flex justify-center items-center">
                <div class="flex -space-x-1"> <!-- Slight overlap for compact feel -->
                    @if (player.hand.length === 0) {
                      <div class="h-16 w-12 bg-gray-900/50 rounded border border-dashed border-gray-700"></div>
                      <div class="h-16 w-12 bg-gray-900/50 rounded border border-dashed border-gray-700 ml-1"></div>
                    }
                    @for (card of player.hand; track card.id) {
                      <div class="transform first:-rotate-3 last:rotate-3 origin-bottom transition-transform duration-300">
                        <playing-card 
                            [card]="card" 
                            size="sm"
                            [faceDown]="!gameService.winnerName()"
                        ></playing-card>
                      </div>
                    }
                </div>
              </div>
            </div>
          }
          
          @if (otherPlayers().length === 0) {
             <div class="col-span-full text-center text-gray-500 py-8 italic text-xs border border-dashed border-gray-800 rounded-xl bg-gray-900/50">
               Chưa có đối thủ nào...
             </div>
          }
        </div>
      </div>

      <!-- 2. MY AREA (Bottom - Fixed - Large) -->
      <div class="absolute bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-700 px-2 pt-2 pb-4 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-20">
        @if (me(); as myPlayer) {
          <div class="max-w-4xl mx-auto flex flex-col">
            
            <!-- Controls Toolbar -->
            <div class="flex justify-between items-center mb-2 gap-2">
               <!-- Left: Identity -->
               <div class="flex flex-col min-w-0">
                  <span class="text-[10px] text-green-400 font-bold uppercase tracking-wider leading-none">BÀI CỦA BẠN</span>
                  <div class="flex items-baseline gap-2">
                    <span class="text-lg font-bold text-white truncate">{{ myPlayer.name }}</span>
                    <span class="bg-yellow-500/10 text-yellow-500 text-xs px-1.5 py-0.5 rounded border border-yellow-500/30 font-mono whitespace-nowrap">
                      {{ myPlayer.score }}
                    </span>
                  </div>
               </div>

               <!-- Right: Buttons -->
               <div class="flex items-center gap-2">
                  <!-- Hide Button -->
                  <button 
                    (click)="toggleCardsHidden()"
                    class="h-10 px-3 rounded-lg font-bold text-sm transition-all border flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                    [class.bg-blue-600]="!cardsHidden()"
                    [class.border-blue-500]="!cardsHidden()"
                    [class.text-white]="!cardsHidden()"
                    [class.bg-gray-700]="cardsHidden()"
                    [class.border-gray-600]="cardsHidden()"
                    [class.text-gray-300]="cardsHidden()"
                  >
                    <span class="text-lg leading-none">{{ cardsHidden() ? '🙈' : '👁️' }}</span>
                    <span class="hidden sm:inline text-xs">{{ cardsHidden() ? 'Hiện Bài' : 'Xem Bài' }}</span>
                  </button>

                  <!-- HOST ONLY Group -->
                  @if (gameService.isHost()) {
                     <div class="h-6 w-px bg-gray-700 mx-0.5"></div>
                     
                     <!-- Self Win (Moved here) -->
                     @if (gameService.isRoundActive()) {
                        <button 
                            (click)="selectWinner(myPlayer)"
                            class="h-10 px-3 bg-yellow-600/20 hover:bg-yellow-600 text-yellow-500 hover:text-white border border-yellow-600/50 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                            title="Chọn mình thắng"
                        >
                            <span class="text-base leading-none">🏆</span>
                            <span class="hidden sm:inline">Thắng</span>
                        </button>
                     }

                     <!-- Deal Button -->
                     <button 
                       (click)="dealRound()" 
                       [disabled]="gameService.isRoundActive()"
                       class="h-10 px-4 rounded-lg font-bold text-white text-xs sm:text-sm transition-colors shadow border-b-2 active:border-b-0 active:translate-y-[2px] whitespace-nowrap min-w-[80px]"
                       [class.bg-green-600]="!gameService.isRoundActive()"
                       [class.border-green-800]="!gameService.isRoundActive()"
                       [class.bg-gray-700]="gameService.isRoundActive()"
                       [class.border-gray-900]="gameService.isRoundActive()"
                       [class.text-gray-500]="gameService.isRoundActive()"
                     >
                       {{ gameService.isRoundActive() ? 'Đang Chơi' : 'Chia Bài' }}
                     </button>
                  }
               </div>
            </div>

            <!-- Cards Container -->
            <div class="flex justify-center items-center h-44 sm:h-52 bg-gradient-to-b from-black/40 to-black/20 rounded-xl border border-white/5 relative overflow-hidden">
               
               @if (myPlayer.hand.length === 0) {
                  <div class="flex flex-col items-center animate-pulse gap-2">
                    <div class="flex gap-2 opacity-30">
                        <div class="w-16 h-24 bg-gray-600 rounded"></div>
                        <div class="w-16 h-24 bg-gray-600 rounded"></div>
                    </div>
                    <span class="text-gray-400 text-xs">Chờ chủ phòng chia bài...</span>
                  </div>
               }

               <div class="flex items-center justify-center gap-2 sm:gap-6 px-4">
                   @for (card of myPlayer.hand; track card.id) {
                     <div class="transform transition-all duration-300 hover:-translate-y-4 hover:scale-105 hover:z-10 cursor-pointer first:-rotate-3 last:rotate-3 origin-bottom-center drop-shadow-2xl">
                        <playing-card 
                          [card]="card" 
                          size="lg" 
                          [faceDown]="cardsHidden()"
                        ></playing-card>
                     </div>
                   }
               </div>
            </div>
          </div>
        }
      </div>

      <!-- Winner Modal -->
      @if (gameService.winnerName()) {
        <div class="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 pointer-events-auto">
          <div class="bg-gray-900 border-2 border-yellow-500 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center animate-bounce-in relative overflow-hidden">
             <!-- Confetti Background (Fixed: Added pointer-events-none) -->
             <div class="absolute inset-0 bg-[radial-gradient(circle,rgba(255,215,0,0.1)_0%,transparent_70%)] pointer-events-none"></div>
             
             <!-- Content Wrapper (Added relative z-10) -->
             <div class="relative z-10">
                <div class="text-6xl mb-4 animate-bounce">🏆</div>
                <h3 class="text-gray-400 uppercase tracking-widest text-xs mb-2">Người chiến thắng</h3>
                <p class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-100 mb-8 break-words drop-shadow-sm">
                  {{ gameService.winnerName() }}
                </p>
                
                @if (gameService.isHost()) {
                  <button 
                    (click)="resetRound()"
                    class="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 px-6 rounded-xl shadow-lg active:scale-95 transition-transform"
                  >
                    Ván Tiếp Theo
                  </button>
                } @else {
                  <div class="flex items-center justify-center gap-2 text-sm text-gray-400 bg-gray-800 py-3 rounded-lg border border-gray-700">
                    <div class="w-4 h-4 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
                    Đang chờ chủ phòng...
                  </div>
                }
             </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
    @keyframes bounceIn {
      0% { opacity: 0; transform: scale(0.3); }
      100% { opacity: 1; transform: scale(1); }
    }
    .animate-bounce-in {
      animation: bounceIn 0.4s cubic-bezier(0.215, 0.610, 0.355, 1.000) both;
    }
  `]
})
export class GameViewComponent {
  gameService = inject(GameService);
  cardsHidden = signal<boolean>(false);

  me = computed(() => this.gameService.players().find(p => p.id === this.gameService.myId()));
  otherPlayers = computed(() => this.gameService.players().filter(p => p.id !== this.gameService.myId()));

  toggleCardsHidden() {
    this.cardsHidden.update(v => !v);
  }

  dealRound() {
    this.gameService.startNewRound();
  }

  resetRound() {
    this.gameService.resetRound();
  }

  selectWinner(player: Player) {
    if (confirm(`Xác nhận ${player.name} thắng?`)) {
      this.gameService.awardWinner(player.id, player.name);
    }
  }
}
