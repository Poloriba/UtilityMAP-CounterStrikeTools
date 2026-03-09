import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <mat-icon>gps_fixed</mat-icon>
      <span style="margin-left: 8px; font-weight: bold">UtilityMAP CS2</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/lineups">
        <mat-icon>list</mat-icon> Lineups
      </button>
      <button mat-raised-button color="accent" routerLink="/lineups/new">
        <mat-icon>add</mat-icon> Nouvelle
      </button>
    </mat-toolbar>
    <div class="main-content">
      <router-outlet />
    </div>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .main-content { padding: 24px; max-width: 1200px; margin: 0 auto; }
    mat-toolbar mat-icon { font-size: 28px; }
  `]
})
export class AppComponent {}
