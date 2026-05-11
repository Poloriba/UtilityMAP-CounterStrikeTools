import { Component, inject, OnInit } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { routeAnimations } from './route-animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  animations: [routeAnimations],
  template: `
    <mat-toolbar class="app-toolbar">
      <a routerLink="/lineups" class="logo-link">
        <mat-icon>gps_fixed</mat-icon>
        <span class="logo-text">UtilityMAP CS2</span>
      </a>
      <span class="spacer"></span>

      <!-- Navigation desktop -->
      <div class="nav-desktop">
        <button mat-button routerLink="/lineups" routerLinkActive="nav-active" [routerLinkActiveOptions]="{exact: true}">
          <mat-icon>list</mat-icon> Lineups
        </button>
        <button mat-button routerLink="/playground" routerLinkActive="nav-active">
          <mat-icon>map</mat-icon> Playground
        </button>
        <button mat-button routerLink="/execs" routerLinkActive="nav-active">
          <mat-icon>bolt</mat-icon> Execs
        </button>
        <button mat-raised-button class="btn-new" routerLink="/lineups/new">
          <mat-icon>add</mat-icon> Nouvelle
        </button>
      </div>

      <button mat-icon-button (click)="theme.toggle()"
        [matTooltip]="theme.isDark() ? 'Mode clair' : 'Mode sombre'">
        <mat-icon>{{ theme.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>

      <!-- Menu hamburger mobile -->
      <button mat-icon-button class="nav-mobile-trigger" [matMenuTriggerFor]="mobileMenu" matTooltip="Menu">
        <mat-icon>menu</mat-icon>
      </button>
      <mat-menu #mobileMenu="matMenu" xPosition="before">
        <button mat-menu-item routerLink="/lineups">
          <mat-icon>list</mat-icon><span>Lineups</span>
        </button>
        <button mat-menu-item routerLink="/playground">
          <mat-icon>map</mat-icon><span>Playground</span>
        </button>
        <button mat-menu-item routerLink="/execs">
          <mat-icon>bolt</mat-icon><span>Execs</span>
        </button>
        <button mat-menu-item routerLink="/lineups/new">
          <mat-icon style="color: var(--accent-orange)">add</mat-icon><span>Nouvelle lineup</span>
        </button>
      </mat-menu>
    </mat-toolbar>
    <div class="main-content" [@routeAnimations]="prepareRoute()">
      <router-outlet />
    </div>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    .main-content {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
      flex: 1;
      background-color: var(--bg-primary);
    }
    .app-toolbar {
      background: var(--bg-toolbar);
      color: var(--text-toolbar);
    }
    .logo-link mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .logo-text { margin-left: 8px; font-weight: bold; }
    .app-toolbar .mat-mdc-button { color: var(--text-toolbar); }
    .app-toolbar .mat-mdc-icon-button { color: var(--text-toolbar); }
    .logo-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }
    .nav-desktop { display: flex; align-items: center; gap: 4px; }
    .nav-mobile-trigger { display: none; }
    .btn-new { background: var(--accent-orange) !important; color: #fff !important; }
    .nav-active {
      color: #fff !important;
      border-bottom: 2px solid var(--accent-orange);
      border-radius: 0;
    }

    /* Tablette et mobile : on bascule sur le hamburger */
    @media (max-width: 768px) {
      .nav-desktop { display: none; }
      .nav-mobile-trigger { display: inline-flex; }
      .main-content { padding: 16px; }
    }

    /* Mobile : on masque le texte du logo pour gagner de la place */
    @media (max-width: 480px) {
      .logo-text { display: none; }
      .main-content { padding: 12px; }
    }
  `]
})
export class AppComponent implements OnInit {
  theme = inject(ThemeService);
  private readonly contexts = inject(ChildrenOutletContexts);

  ngOnInit(): void {
    this.theme.applyTheme();
  }

  prepareRoute(): number | undefined {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
