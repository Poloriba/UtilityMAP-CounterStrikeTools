import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CS2_MAPS, GameMap } from '../../models/map.model';
import { LineupService } from '../../services/lineup.service';

export interface PlayerToken {
  id: string;
  side: 'T' | 'CT';
  number: number;
  defaultX: number; // % depuis la gauche du conteneur
  defaultY: number; // % depuis le haut du conteneur
}

export interface GrenadeToken {
  id: string;
  type: 'smoke' | 'flash' | 'molotov' | 'he';
  label: string;
  name: string;
  defaultX: number;
  defaultY: number;
}

const GRENADE_DEFS = [
  { type: 'smoke'   as const, label: 'SMK', name: 'Smoke',      defaultX: 72, defaultY: 4  },
  { type: 'flash'   as const, label: 'FLS', name: 'Flash',      defaultX: 84, defaultY: 4  },
  { type: 'molotov' as const, label: 'MOL', name: 'Molotov',    defaultX: 72, defaultY: 14 },
  { type: 'he'      as const, label: 'HE',  name: 'HE Grenade', defaultX: 84, defaultY: 14 },
];

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    RouterLink,
    DragDropModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatTooltipModule
  ],
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss']
})
export class PlaygroundComponent implements OnInit {
  maps = CS2_MAPS;
  selectedMap: GameMap | null = null;
  lineupCount = 0;
  imageError = false;

  players: PlayerToken[] = [
    // CT (bleu) — rangée du haut
    { id: 'ct1', side: 'CT', number: 1, defaultX: 10, defaultY: 4 },
    { id: 'ct2', side: 'CT', number: 2, defaultX: 22, defaultY: 4 },
    { id: 'ct3', side: 'CT', number: 3, defaultX: 34, defaultY: 4 },
    { id: 'ct4', side: 'CT', number: 4, defaultX: 46, defaultY: 4 },
    { id: 'ct5', side: 'CT', number: 5, defaultX: 58, defaultY: 4 },
    // T (orange) — rangée du bas
    { id: 't1',  side: 'T',  number: 1, defaultX: 10, defaultY: 84 },
    { id: 't2',  side: 'T',  number: 2, defaultX: 22, defaultY: 84 },
    { id: 't3',  side: 'T',  number: 3, defaultX: 34, defaultY: 84 },
    { id: 't4',  side: 'T',  number: 4, defaultX: 46, defaultY: 84 },
    { id: 't5',  side: 'T',  number: 5, defaultX: 58, defaultY: 84 },
  ];

  grenadeDefs = GRENADE_DEFS;
  grenades: GrenadeToken[] = GRENADE_DEFS.map(d => ({ id: `${d.type}_1`, ...d }));
  grenadeCounters: Record<string, number> = Object.fromEntries(GRENADE_DEFS.map(d => [d.type, 1]));

  dragPositions: Record<string, { x: number; y: number }> = {};

  constructor(private router: Router, private lineupService: LineupService) {}

  ngOnInit(): void {
    this.initDragPositions();
    this.selectMap(this.maps[0]);
  }

  initDragPositions(): void {
    // Créer de nouveaux objets à chaque fois pour forcer la détection de changement Angular
    const positions: Record<string, { x: number; y: number }> = {};
    this.players.forEach(p => positions[p.id] = { x: 0, y: 0 });
    this.grenades.forEach(g => positions[g.id] = { x: 0, y: 0 });
    this.dragPositions = { ...positions };
  }

  resetPlayers(): void {
    this.grenades = GRENADE_DEFS.map(d => ({ id: `${d.type}_1`, ...d }));
    this.grenadeCounters = Object.fromEntries(GRENADE_DEFS.map(d => [d.type, 1]));
    this.initDragPositions();
  }

  addGrenade(type: GrenadeToken['type']): void {
    const def = GRENADE_DEFS.find(d => d.type === type)!;
    this.grenadeCounters[type]++;
    const id = `${type}_${this.grenadeCounters[type]}`;
    this.grenades = [...this.grenades, { id, ...def }];
    this.dragPositions = { ...this.dragPositions, [id]: { x: 0, y: 0 } };
  }

  selectMap(map: GameMap): void {
    this.selectedMap = map;
    this.imageError = false;
    this.lineupCount = 0;
    this.initDragPositions();
    this.lineupService.getAll({ map: map.name }).subscribe({
      next: lineups => this.lineupCount = lineups.length
    });
  }

  onImageError(): void {
    this.imageError = true;
  }

  goToLineups(): void {
    if (this.selectedMap) {
      this.router.navigate(['/lineups'], {
        queryParams: { map: this.selectedMap.name }
      });
    }
  }
}
