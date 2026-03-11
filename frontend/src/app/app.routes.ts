import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'lineups', pathMatch: 'full' },
  {
    path: 'lineups',
    loadComponent: () =>
      import('./pages/lineup-list/lineup-list.component').then(m => m.LineupListComponent)
  },
  {
    path: 'lineups/new',
    loadComponent: () =>
      import('./pages/lineup-form/lineup-form.component').then(m => m.LineupFormComponent)
  },
  {
    path: 'lineups/:id',
    loadComponent: () =>
      import('./pages/lineup-detail/lineup-detail.component').then(m => m.LineupDetailComponent)
  },
  {
    path: 'lineups/:id/edit',
    loadComponent: () =>
      import('./pages/lineup-form/lineup-form.component').then(m => m.LineupFormComponent)
  },
  {
    path: 'playground',
    loadComponent: () =>
      import('./pages/playground/playground.component').then(m => m.PlaygroundComponent)
  },
  { path: '**', redirectTo: 'lineups' }
];
