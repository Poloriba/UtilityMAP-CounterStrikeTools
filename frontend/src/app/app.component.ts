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
    <mat-toolbar style="background: #1b1b2f; color: #e0e0e0;">
      <mat-icon>gps_fixed</mat-icon>
      <span style="margin-left: 8px; font-weight: bold">UtilityMAP CS2</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/lineups">
        <mat-icon>list</mat-icon> Lineups
      </button>
      <button mat-button routerLink="/playground">
        <mat-icon>map</mat-icon> Playground
      </button>
      <button mat-button routerLink="/execs">
        <mat-icon>bolt</mat-icon> Execs
      </button>
      <button mat-raised-button style="background: #e67e22; color: #fff;" routerLink="/lineups/new">
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
    mat-toolbar .mat-mdc-button { color: #e0e0e0; }
  `]
})
export class AppComponent {}
