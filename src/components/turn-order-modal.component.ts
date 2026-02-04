
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../services/game.service';
import { PlayingCardComponent } from './playing-card.component';

@Component({
  selector: 'app-turn-order-modal',
  standalone: true,
  imports: [CommonModule, PlayingCardComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" (click)="close.emit()">
      <div 
        class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-900 to-gray-900 p-4 flex justify-between items-center border-b border-gray-700">
           <div class="flex items-center gap-2">
             <span class="text-2xl">🔢</span>
             <h2 class="text-lg font-bold text-white uppercase tracking-wider">Thứ Tự Đánh</h2>
           </div>
           <button (click)="close.emit()" class="text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
             ✕
           </button>
        </div>

        <!-- Guide Text -->
        <div class="bg-gray-800 px-4 py-2 text-[10px] text-gray-400 border-b border-gray-700 text-center">
            Độ lớn: K > Q > J > 10 > ... > 2 > A. (Chất: Rô ♦ > Cơ ♥ > Tép ♣ > Bích ♠)
        </div>

        <!-- List -->
        <div class="p-4 max-h-[60vh] overflow-y-auto custom-scroll">
           @for (player of players(); track player.id; let i = $index) {
             <div class="flex items-center justify-between p-3 mb-2 rounded-xl border bg-gray-800 border-gray-700 relative overflow-hidden">
                
                <!-- Rank & Name -->
                <div class="flex items-center gap-3">
                   <div class="w-8 h-8 flex items-center justify-center font-black text-lg rounded-full shrink-0 bg-gray-700 text-gray-300 border border-gray-600">
                     {{ i + 1 }}
                   </div>
                   <span class="font-bold text-white text-sm truncate max-w-[120px]">{{ player.name }}</span>
                </div>

                <!-- The Card that decided it -->
                <div class="flex items-center gap-2">
                   <span class="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Lá bài</span>
                   <div class="transform scale-75 origin-right">
                       <playing-card 
                            [card]="player.initialOrderCard || player.orderCard" 
                            size="sm"
                        ></playing-card>
                   </div>
                </div>
             </div>
           }

           @if (players().length === 0) {
             <div class="text-center text-gray-500 py-8 italic">Chưa xác định thứ tự...</div>
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
export class TurnOrderModalComponent {
  players = input.required<Player[]>();
  close = output();
}
