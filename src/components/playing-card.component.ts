
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../services/game.service';

@Component({
  selector: 'playing-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="relative bg-white rounded-lg shadow-md border-2 select-none transition-transform hover:-translate-y-2 duration-300"
      [class.border-red-500]="isRed()"
      [class.border-gray-800]="!isRed()"
      [class.w-16]="size() === 'sm'"
      [class.h-24]="size() === 'sm'"
      [class.w-24]="size() === 'md'"
      [class.h-36]="size() === 'md'"
      [class.w-32]="size() === 'lg'"
      [class.h-48]="size() === 'lg'"
    >
      @if (!faceDown()) {
        <!-- Top Left Value -->
        <div class="absolute top-1 left-1 flex flex-col items-center leading-none">
          <span class="font-bold text-lg" [class.text-red-600]="isRed()" [class.text-black]="!isRed()">
            {{ card()?.rank }}
          </span>
          <span class="text-sm" [innerHTML]="suitIcon()"></span>
        </div>

        <!-- Center Suit -->
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-4xl" [class.text-red-600]="isRed()" [class.text-black]="!isRed()" [innerHTML]="suitIcon()"></span>
        </div>

        <!-- Bottom Right Value (Inverted) -->
        <div class="absolute bottom-1 right-1 flex flex-col items-center leading-none rotate-180">
          <span class="font-bold text-lg" [class.text-red-600]="isRed()" [class.text-black]="!isRed()">
            {{ card()?.rank }}
          </span>
          <span class="text-sm" [innerHTML]="suitIcon()"></span>
        </div>
      } @else {
        <!-- Face Down Pattern -->
        <div class="absolute inset-1 bg-blue-800 rounded opacity-90 pattern-grid">
           <div class="w-full h-full flex items-center justify-center">
             <div class="w-8 h-8 rounded-full border-2 border-white opacity-20"></div>
           </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .pattern-grid {
      background-image: repeating-linear-gradient(45deg, #1e40af 25%, transparent 25%, transparent 75%, #1e40af 75%, #1e40af), repeating-linear-gradient(45deg, #1e40af 25%, #172554 25%, #172554 75%, #1e40af 75%, #1e40af);
      background-position: 0 0, 10px 10px;
      background-size: 20px 20px;
    }
  `]
})
export class PlayingCardComponent {
  card = input<Card | undefined>(undefined);
  faceDown = input<boolean>(false);
  size = input<'sm' | 'md' | 'lg'>('md');

  isRed = computed(() => {
    const s = this.card()?.suit;
    return s === 'hearts' || s === 'diamonds';
  });

  suitIcon = computed(() => {
    switch (this.card()?.suit) {
      case 'hearts': return '&hearts;';
      case 'diamonds': return '&diams;';
      case 'clubs': return '&clubs;';
      case 'spades': return '&spades;';
      default: return '';
    }
  });
}
