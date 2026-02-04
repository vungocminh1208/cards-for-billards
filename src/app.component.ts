
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from './services/game.service';
import { SetupViewComponent } from './components/setup-view.component';
import { LobbyViewComponent } from './components/lobby-view.component';
import { OrderViewComponent } from './components/order-view.component';
import { GameViewComponent } from './components/game-view.component';
import { LeaderboardModalComponent } from './components/leaderboard-modal.component';
import { TurnOrderModalComponent } from './components/turn-order-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    SetupViewComponent, 
    LobbyViewComponent,
    OrderViewComponent, 
    GameViewComponent,
    LeaderboardModalComponent,
    TurnOrderModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent {
  gameService = inject(GameService);
  showLeaderboard = signal<boolean>(false);
  showTurnOrder = signal<boolean>(false);

  toggleLeaderboard() {
    this.showLeaderboard.update(v => !v);
  }
  
  toggleTurnOrder() {
    this.showTurnOrder.update(v => !v);
  }
}
