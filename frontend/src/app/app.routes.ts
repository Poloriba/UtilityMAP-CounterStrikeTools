import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'lineups', pathMatch: 'full' },
  {
    path: 'lineups',
    loadComponent: () =>
      import('./pages/lineup-list/lineup-list.component').then(m => m.LineupListComponent),
    data: { animation: 1 }
  },
  {
    path: 'lineups/new',
    loadComponent: () =>
      import('./pages/lineup-form/lineup-form.component').then(m => m.LineupFormComponent),
    data: { animation: 2 }
  },
  {
    path: 'lineups/:id',
    loadComponent: () =>
      import('./pages/lineup-detail/lineup-detail.component').then(m => m.LineupDetailComponent),
    data: { animation: 3 }
  },
  {
    path: 'lineups/:id/edit',
    loadComponent: () =>
      import('./pages/lineup-form/lineup-form.component').then(m => m.LineupFormComponent),
    data: { animation: 4 }
  },
  {
    path: 'playground',
    loadComponent: () =>
      import('./pages/playground-router/playground-router.component').then(m => m.PlaygroundRouterComponent),
    data: { animation: 5 }
  },
  {
    path: 'execs',
    loadComponent: () =>
      import('./pages/exec-list/exec-list.component').then(m => m.ExecListComponent),
    data: { animation: 6 }
  },
  { path: '**', redirectTo: 'lineups' }
];
