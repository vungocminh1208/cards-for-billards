
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-setup-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
      <h2 class="text-2xl font-bold mb-2 text-green-400 text-center">Tham Gia Game</h2>
      
      <div class="bg-blue-900/30 border border-blue-700/50 p-3 rounded mb-6 text-xs text-blue-200">
        ℹ️ Nhập tên của bạn để bắt đầu. <br>
        Mỗi người chơi mở 1 tab trình duyệt hoặc dùng thiết bị khác nhau.
      </div>
      
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Tên hiển thị</label>
        <input 
          #nameInput
          type="text" 
          [(ngModel)]="playerName"
          (keyup.enter)="join()"
          placeholder="Tên của bạn..."
          class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-lg"
        />
      </div>

      <div class="flex flex-col gap-3">
        <button 
          (click)="join()"
          [disabled]="!playerName.trim()"
          class="w-full bg-gradient-to-r from-green-600 to-green-500 disabled:opacity-50 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-lg shadow-lg active:scale-[0.98] text-lg transition-transform"
        >
          Vào Phòng
        </button>

        <button 
          (click)="clearData()"
          class="w-full bg-gray-700 hover:bg-red-900/50 text-gray-300 hover:text-red-300 font-bold py-3 rounded-lg border border-gray-600 text-sm transition-colors"
        >
          ♻️ Reset Game (Xóa tất cả)
        </button>
      </div>
    </div>
  `,
})
export class SetupViewComponent implements OnInit {
  gameService = inject(GameService);
  playerName = '';

  ngOnInit() {
    // Nếu có tên cũ trong Session, fill vào
    const saved = sessionStorage.getItem('PLAYER_NAME');
    if (saved) this.playerName = saved;
  }

  join() {
    if (this.playerName.trim()) {
      this.gameService.joinGame(this.playerName.trim());
    }
  }

  clearData() {
    if(confirm('Reset game sẽ xóa toàn bộ người chơi hiện tại. Bạn chắc chứ?')) {
      this.gameService.clearGameData();
    }
  }
}
