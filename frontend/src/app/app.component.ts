import { Component, inject, OnInit } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { routeAnimations } from './route-animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule],
  animations: [routeAnimations],
  template: `
    <mat-toolbar class="app-toolbar">
      <a routerLink="/lineups" class="logo-link">
        <mat-icon>gps_fixed</mat-icon>
        <span style="margin-left: 8px; font-weight: bold">UtilityMAP CS2</span>
      </a>
      <span class="spacer"></span>
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
      <button mat-icon-button (click)="theme.toggle()"
        [matTooltip]="theme.isDark() ? 'Mode clair' : 'Mode sombre'">
        <mat-icon>{{ theme.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>
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
    .app-toolbar .mat-mdc-button { color: var(--text-toolbar); }
    .app-toolbar .mat-mdc-icon-button { color: var(--text-toolbar); }
    .logo-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }
    .btn-new { background: var(--accent-orange) !important; color: #fff !important; }
    .nav-active {
      color: #fff !important;
      border-bottom: 2px solid var(--accent-orange);
      border-radius: 0;
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
