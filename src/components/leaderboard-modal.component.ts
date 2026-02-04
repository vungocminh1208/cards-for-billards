
import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../services/game.service';

@Component({
  selector: 'app-leaderboard-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" (click)="close.emit()">
      <div 
        class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-900 to-gray-900 p-4 flex justify-between items-center border-b border-gray-700">
           <div class="flex items-center gap-2">
             <span class="text-2xl">🏆</span>
             <h2 class="text-lg font-bold text-white uppercase tracking-wider">Bảng Xếp Hạng</h2>
           </div>
           <button (click)="close.emit()" class="text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
             ✕
           </button>
        </div>

        <!-- List -->
        <div class="p-4 max-h-[60vh] overflow-y-auto custom-scroll">
           @for (player of sortedPlayers(); track player.id; let i = $index) {
             <div class="flex items-center justify-between p-3 mb-2 rounded-xl border transition-colors relative overflow-hidden"
                [class.bg-yellow-900-20]="i === 0"
                [class.border-yellow-600]="i === 0"
                [class.bg-gray-800]="i > 0"
                [class.border-gray-700]="i > 0"
             >
                <!-- Rank Medal/Number -->
                <div class="flex items-center gap-4 z-10">
                   <div class="w-8 h-8 flex items-center justify-center font-black text-lg rounded-full shrink-0"
                     [ngClass]="getRankStyle(i)"
                   >
                     {{ i + 1 }}
                   </div>
                   
                   <div class="flex flex-col">
                      <span class="font-bold text-white text-sm" [class.text-yellow-400]="i === 0">{{ player.name }}</span>
                      @if (i === 0) {
                        <span class="text-[10px] text-yellow-500/80">👑 Đang dẫn đầu</span>
                      }
                   </div>
                </div>

                <!-- Score -->
                <div class="font-mono text-white font-bold text-lg z-10">
                   {{ player.score }} <span class="text-xs text-gray-500 font-normal">pts</span>
                </div>

                <!-- Gradient Overlay for Top 1 -->
                @if (i === 0) {
                   <div class="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-transparent pointer-events-none"></div>
                }
             </div>
           }

           @if (sortedPlayers().length === 0) {
             <div class="text-center text-gray-500 py-8 italic">Chưa có dữ liệu...</div>
           }
        </div>
        
        <!-- Footer -->
        <div class="p-4 bg-gray-950 border-t border-gray-800 text-center">
           <button (click)="close.emit()" class="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg text-sm transition-colors border border-gray-600">
             Đóng
           </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-yellow-900-20 { background-color: rgba(113, 63, 18, 0.2); }
    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 2px; }
    
    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-scale-in {
      animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `]
})
export class LeaderboardModalComponent {
  players = input.required<Player[]>();
  close = output();

  sortedPlayers = computed(() => {
    return [...this.players()].sort((a, b) => b.score - a.score);
  });

  getRankStyle(index: number): string {
    switch (index) {
      case 0: return 'bg-yellow-500 text-yellow-950 shadow-[0_0_10px_rgba(234,179,8,0.5)]'; // Gold
      case 1: return 'bg-gray-300 text-gray-800';   // Silver
      case 2: return 'bg-orange-700 text-orange-200'; // Bronze
      default: return 'bg-gray-700 text-gray-400 text-sm'; // Others
    }
  }
}
