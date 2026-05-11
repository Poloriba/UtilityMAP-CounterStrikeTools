import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { CS2_MAPS, GameMap } from '../../models/map.model';
import { Lineup } from '../../models/lineup.model';
import { UTILITY_COLORS } from '../../models/utility-colors';
import { Exec, ExecSnapshot } from '../../models/exec.model';
import { ExecService } from '../../services/exec.service';

// Taille de référence de la map en desktop (correspond au flex 0 0 700px du desktop)
const DESKTOP_MAP_SIZE = 700;

// Positions joueurs par défaut (identiques au desktop)
const DEFAULT_PLAYERS = [
  { id: 'ct1', side: 'CT' as const, number: 1, defaultX: 10, defaultY: 4 },
  { id: 'ct2', side: 'CT' as const, number: 2, defaultX: 22, defaultY: 4 },
  { id: 'ct3', side: 'CT' as const, number: 3, defaultX: 34, defaultY: 4 },
  { id: 'ct4', side: 'CT' as const, number: 4, defaultX: 46, defaultY: 4 },
  { id: 'ct5', side: 'CT' as const, number: 5, defaultX: 58, defaultY: 4 },
  { id: 't1',  side: 'T'  as const, number: 1, defaultX: 10, defaultY: 84 },
  { id: 't2',  side: 'T'  as const, number: 2, defaultX: 22, defaultY: 84 },
  { id: 't3',  side: 'T'  as const, number: 3, defaultX: 34, defaultY: 84 },
  { id: 't4',  side: 'T'  as const, number: 4, defaultX: 46, defaultY: 84 },
  { id: 't5',  side: 'T'  as const, number: 5, defaultX: 58, defaultY: 84 },
];

// Position finale d'un token en %, à partir de sa position par défaut (%) et du drag offset (px)
function resolvePosition(defaultPct: number, offsetPx: number): number {
  return defaultPct + (offsetPx / DESKTOP_MAP_SIZE) * 100;
}

@Component({
  selector: 'app-playground-mobile',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule, MatChipsModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatSelectModule,
    MatSnackBarModule, MatDividerModule,
  ],
  templateUrl: './playground-mobile.component.html',
  styleUrls: ['./playground-mobile.component.scss']
})
/** Vue mobile read-only du Playground : sélection de map → liste d'execs → consultation d'un exec */
export class PlaygroundMobileComponent implements OnInit {
  maps = CS2_MAPS;
  selectedMap: GameMap | null = null;
  imageError = false;

  execs: Exec[] = [];
  loadingExecs = false;

  // Exec actuellement ouverte (vue détail)
  currentExec: Exec | null = null;
  currentSnapshot: ExecSnapshot | null = null;

  readonly typeColors = UTILITY_COLORS;
  readonly defaultPlayers = DEFAULT_PLAYERS;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly execService: ExecService,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const execId = this.route.snapshot.queryParamMap.get('exec');
    if (execId) {
      this.execService.getById(execId).subscribe({
        next: exec => {
          const map = this.maps.find(m => m.name === exec.mapName);
          if (map) this.selectedMap = map;
          this.openExec(exec);
        },
        error: () => this.selectMap(this.maps[0])
      });
    } else {
      this.selectMap(this.maps[0]);
    }
  }

  selectMap(map: GameMap): void {
    this.selectedMap = map;
    this.imageError = false;
    this.currentExec = null;
    this.currentSnapshot = null;
    this.loadExecs();
  }

  loadExecs(): void {
    if (!this.selectedMap) return;
    this.loadingExecs = true;
    this.execService.getAll(this.selectedMap.name).subscribe({
      next: execs => { this.execs = execs; this.loadingExecs = false; },
      error: () => {
        this.loadingExecs = false;
        this.snackBar.open('Erreur lors du chargement des execs', 'Fermer', { duration: 3000 });
      }
    });
  }

  openExec(exec: Exec): void {
    try {
      const snapshot: ExecSnapshot = JSON.parse(exec.snapshotJson);
      this.currentExec = exec;
      this.currentSnapshot = snapshot;
    } catch {
      this.snackBar.open('Snapshot illisible', 'Fermer', { duration: 3000 });
    }
  }

  closeExec(): void {
    this.currentExec = null;
    this.currentSnapshot = null;
  }

  onImageError(): void {
    this.imageError = true;
  }

  // Joueurs actuellement en vie pour l'exec ouverte
  get alivePlayers() {
    if (!this.currentSnapshot) return [];
    const dead = this.currentSnapshot.deadPlayerIds ?? [];
    return this.defaultPlayers.filter(p => !dead.includes(p.id));
  }

  // Calcule la position en % d'un token (joueur ou grenade) à partir du snapshot
  posX(id: string, defaultX: number): number {
    const off = this.currentSnapshot?.dragPositions?.[id]?.x ?? 0;
    return resolvePosition(defaultX, off);
  }

  posY(id: string, defaultY: number): number {
    const off = this.currentSnapshot?.dragPositions?.[id]?.y ?? 0;
    return resolvePosition(defaultY, off);
  }

  // Lookup d'une lineup associée à un lien (par ID)
  findLineup(lineupId: string): Lineup | undefined {
    return this.currentExec?.lineups.find(l => l.id === lineupId);
  }

  // Récupère la position défaut d'un joueur (pour les flèches SVG)
  getPlayerDefault(playerId: string, axis: 'x' | 'y'): number {
    const p = this.defaultPlayers.find(pl => pl.id === playerId);
    if (!p) return 0;
    return axis === 'x' ? p.defaultX : p.defaultY;
  }

  // Récupère la position défaut d'une grenade depuis le snapshot
  getGrenadeDefault(grenadeId: string, axis: 'x' | 'y'): number {
    const g = this.currentSnapshot?.grenades.find(gr => gr.id === grenadeId);
    if (!g) return 0;
    return axis === 'x' ? g.defaultX : g.defaultY;
  }
}
