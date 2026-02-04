
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';
import { PlayingCardComponent } from './playing-card.component';

@Component({
  selector: 'app-order-view',
  standalone: true,
  imports: [CommonModule, PlayingCardComponent],
  template: `
    <div class="flex flex-col items-center w-full">
      <div class="text-center mb-6 w-full">
        <h2 class="text-xl font-bold text-green-400">Thứ Tự Đánh</h2>
        @if (gameService.isHost()) {
          <p class="text-gray-400 text-xs mt-1">Chủ phòng chia bài để xếp lượt.</p>
        } @else {
          <p class="text-gray-400 text-xs mt-1">Đang chờ xác định lượt...</p>
        }
      </div>

      <!-- Logic: If no one has cards yet, show Deck (Host only) or Waiting (Client) -->
      @if (!hasOrderCards()) {
        <div class="flex flex-col items-center justify-center h-48 w-full bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
           @if (gameService.isHost()) {
             <div class="relative w-24 h-36 cursor-pointer group" (click)="gameService.dealOrderCards()">
                <div class="absolute inset-0 bg-blue-900 rounded-lg border-2 border-white transform translate-x-1 translate-y-1"></div>
                <div class="absolute inset-0 bg-blue-800 rounded-lg border-2 border-white shadow-xl flex items-center justify-center active:translate-y-1 transition-all">
                   <span class="text-white font-bold text-sm text-center px-1">Chia Bài</span>
                </div>
             </div>
             <p class="text-xs text-gray-500 mt-4 animate-bounce">Nhấn vào bài để chia</p>
           } @else {
             <div class="animate-pulse text-lg text-gray-500 font-bold">⏳ Đang chờ chia...</div>
           }
        </div>
      } @else {
        <!-- Show Result Grid - Mobile Optimized (2 cols, tight gap) -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-20 w-full overflow-y-auto pb-4">
          @for (player of gameService.players(); track player.id) {
            <div class="flex flex-col items-center bg-gray-800 p-3 rounded-xl border border-gray-700 animate-fade-in relative"
               [class.border-green-500]="player.id === gameService.myId()"
               [class.bg-green-900/10]="player.id === gameService.myId()"
            >
              @if (player.id === gameService.myId()) {
                <div class="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
              }
              <span class="text-sm font-bold text-white mb-2 truncate w-full text-center">
                {{ player.name }}
              </span>
              <!-- Use small cards for order view on mobile to save space -->
              <playing-card [card]="player.orderCard" size="sm"></playing-card>
            </div>
          }
        </div>

        <!-- Sticky Footer Action -->
        @if (gameService.isHost()) {
          <div class="fixed bottom-4 left-0 right-0 px-4 flex justify-center z-20">
            <button 
              (click)="gameService.finalizeOrder()"
              class="w-full max-w-md bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-2xl text-lg transform transition active:scale-95 border border-blue-400"
            >
              Vào Game
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }
  `]
})
export class OrderViewComponent {
  gameService = inject(GameService);

  hasOrderCards() {
    return this.gameService.players().some(p => !!p.orderCard);
  }
}
