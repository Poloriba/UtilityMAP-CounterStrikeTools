import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { CS2_MAPS, GameMap } from '../../models/map.model';
import { Lineup } from '../../models/lineup.model';
import { Exec, ExecRequest, ExecSnapshot } from '../../models/exec.model';
import { LineupService } from '../../services/lineup.service';
import { ExecService } from '../../services/exec.service';

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
  { type: 'smoke'   as const, label: 'SMK', name: 'Smoke',      defaultX: 70, defaultY: 4 },
  { type: 'flash'   as const, label: 'FLS', name: 'Flash',      defaultX: 78, defaultY: 4 },
  { type: 'molotov' as const, label: 'MOL', name: 'Molotov',    defaultX: 86, defaultY: 4 },
  { type: 'he'      as const, label: 'HE',  name: 'HE Grenade', defaultX: 94, defaultY: 4 },
];

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    RouterLink,
    FormsModule,
    DragDropModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatListModule, MatSnackBarModule, MatDividerModule
  ],
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss']
})
export class PlaygroundComponent implements OnInit, AfterViewInit {
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

  @ViewChild('dragZone') dragZoneRef!: ElementRef<HTMLElement>;

  dragPositions: Record<string, { x: number; y: number }> = {};
  livePositions: Record<string, { x: number; y: number }> = {};
  selectedPlayerId: string | null = null;
  links: Array<{ playerId: string; grenadeId: string }> = [];
  private _dragDistance = 0;

  // --- Exec state ---
  mapExecs: Exec[] = [];
  mapLineups: Lineup[] = [];
  saveExecName = '';
  selectedLineupIds: string[] = [];
  currentExecId: string | null = null;
  execSaving = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private lineupService: LineupService,
    private execService: ExecService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initDragPositions();
    const execId = this.route.snapshot.queryParamMap.get('exec');
    if (execId) {
      this.execService.getById(execId).subscribe({
        next: exec => this.loadExec(exec),
        error: () => this.selectMap(this.maps[0])
      });
    } else {
      this.selectMap(this.maps[0]);
    }
  }

  ngAfterViewInit(): void {}

  initDragPositions(): void {
    // Créer de nouveaux objets à chaque fois pour forcer la détection de changement Angular
    const positions: Record<string, { x: number; y: number }> = {};
    this.players.forEach(p => positions[p.id] = { x: 0, y: 0 });
    this.grenades.forEach(g => positions[g.id] = { x: 0, y: 0 });
    this.dragPositions = { ...positions };
    this.livePositions = { ...positions };
  }

  resetPlayers(): void {
    this.grenades = GRENADE_DEFS.map(d => ({ id: `${d.type}_1`, ...d }));
    this.grenadeCounters = Object.fromEntries(GRENADE_DEFS.map(d => [d.type, 1]));
    this.links = [];
    this.selectedPlayerId = null;
    this.currentExecId = null;
    this.saveExecName = '';
    this.selectedLineupIds = [];
    this.initDragPositions();
  }

  addGrenade(type: GrenadeToken['type']): void {
    const def = GRENADE_DEFS.find(d => d.type === type)!;
    this.grenadeCounters[type]++;
    const id = `${type}_${this.grenadeCounters[type]}`;
    this.grenades = [...this.grenades, { id, ...def }];
    this.dragPositions = { ...this.dragPositions, [id]: { x: 0, y: 0 } };
    this.livePositions = { ...this.livePositions, [id]: { x: 0, y: 0 } };
  }

  selectMap(map: GameMap): void {
    this.selectedMap = map;
    this.imageError = false;
    this.lineupCount = 0;
    this.links = [];
    this.selectedPlayerId = null;
    this.currentExecId = null;
    this.saveExecName = '';
    this.selectedLineupIds = [];
    this.grenades = GRENADE_DEFS.map(d => ({ id: `${d.type}_1`, ...d }));
    this.grenadeCounters = Object.fromEntries(GRENADE_DEFS.map(d => [d.type, 1]));
    this.initDragPositions();
    this.lineupService.getAll({ map: map.name }).subscribe({
      next: lineups => this.lineupCount = lineups.length
    });
    this.loadExecsForMap(map.name);
    this.loadLineupsForMap(map.name);
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

  onTokenMoved(event: CdkDragMove, id: string): void {
    this._dragDistance = Math.hypot(event.distance.x, event.distance.y);
    const base = this.dragPositions[id] ?? { x: 0, y: 0 };
    this.livePositions = {
      ...this.livePositions,
      [id]: { x: base.x + event.distance.x, y: base.y + event.distance.y }
    };
  }

  onTokenDropped(event: CdkDragEnd, id: string): void {
    const base = this.dragPositions[id] ?? { x: 0, y: 0 };
    const newPos = { x: base.x + event.distance.x, y: base.y + event.distance.y };
    this.dragPositions = { ...this.dragPositions, [id]: newPos };
    this.livePositions = { ...this.livePositions, [id]: newPos };
  }

  onPlayerClick(id: string): void {
    if (this._dragDistance > 5) { this._dragDistance = 0; return; }
    this._dragDistance = 0;
    this.selectedPlayerId = this.selectedPlayerId === id ? null : id;
  }

  onGrenadeClick(id: string): void {
    if (this._dragDistance > 5) { this._dragDistance = 0; return; }
    this._dragDistance = 0;
    if (!this.selectedPlayerId) return;
    const existingIdx = this.links.findIndex(
      l => l.playerId === this.selectedPlayerId && l.grenadeId === id
    );
    if (existingIdx >= 0) {
      this.links = this.links.filter((_, i) => i !== existingIdx);
    } else {
      this.links = [...this.links, { playerId: this.selectedPlayerId, grenadeId: id }];
    }
    this.selectedPlayerId = null;
  }

  clearLinks(): void {
    this.links = [];
    this.selectedPlayerId = null;
  }

  onBackgroundClick(): void {
    this.selectedPlayerId = null;
  }

  getTokenCenter(id: string): { x: number; y: number } {
    if (!this.dragZoneRef) return { x: 0, y: 0 };
    const el = this.dragZoneRef.nativeElement;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const token = [...this.players, ...this.grenades].find(t => t.id === id);
    if (!token) return { x: 0, y: 0 };
    const live = this.livePositions[id] ?? { x: 0, y: 0 };
    return {
      x: (token.defaultX / 100) * w + live.x + 16,
      y: (token.defaultY / 100) * h + live.y + 16,
    };
  }

  getPlayerSide(playerId: string): 'T' | 'CT' {
    return this.players.find(p => p.id === playerId)?.side ?? 'CT';
  }

  isLinkTarget(grenadeId: string): boolean {
    if (!this.selectedPlayerId) return false;
    return !this.links.some(l => l.playerId === this.selectedPlayerId && l.grenadeId === grenadeId);
  }

  isLinked(grenadeId: string): boolean {
    if (!this.selectedPlayerId) return false;
    return this.links.some(l => l.playerId === this.selectedPlayerId && l.grenadeId === grenadeId);
  }

  // --- Exec methods ---

  loadExecsForMap(mapName: string): void {
    this.execService.getAll(mapName).subscribe({
      next: execs => this.mapExecs = execs
    });
  }

  loadLineupsForMap(mapName: string): void {
    this.lineupService.getAll({ map: mapName }).subscribe({
      next: lineups => this.mapLineups = lineups
    });
  }

  loadExec(exec: Exec): void {
    const map = this.maps.find(m => m.name === exec.mapName);
    if (!map) return;

    this.selectedMap = map;
    this.imageError = false;
    this.lineupService.getAll({ map: map.name }).subscribe({
      next: lineups => this.lineupCount = lineups.length
    });

    const snapshot: ExecSnapshot = JSON.parse(exec.snapshotJson);
    this.grenades = snapshot.grenades;
    this.grenadeCounters = { ...snapshot.grenadeCounters };
    this.dragPositions = { ...snapshot.dragPositions };
    this.livePositions = { ...snapshot.dragPositions };
    this.links = [...snapshot.links];
    this.selectedPlayerId = null;

    this.currentExecId = exec.id;
    this.saveExecName = exec.name;
    this.selectedLineupIds = exec.lineups.map(l => l.id);

    this.loadExecsForMap(map.name);
    this.loadLineupsForMap(map.name);
  }

  buildSnapshot(): string {
    const snapshot: ExecSnapshot = {
      dragPositions: { ...this.dragPositions },
      grenadeCounters: { ...this.grenadeCounters },
      grenades: this.grenades.map(g => ({ ...g })),
      links: [...this.links]
    };
    return JSON.stringify(snapshot);
  }

  saveExec(): void {
    if (!this.saveExecName.trim() || !this.selectedMap) return;
    this.execSaving = true;
    const request: ExecRequest = {
      name: this.saveExecName.trim(),
      mapName: this.selectedMap.name,
      snapshotJson: this.buildSnapshot(),
      lineupIds: [...this.selectedLineupIds]
    };

    const obs = this.currentExecId
      ? this.execService.update(this.currentExecId, request)
      : this.execService.create(request);

    obs.subscribe({
      next: saved => {
        this.currentExecId = saved.id;
        this.execSaving = false;
        this.loadExecsForMap(this.selectedMap!.name);
        this.snackBar.open('Exec sauvegardée !', 'Fermer', { duration: 2500 });
      },
      error: () => {
        this.execSaving = false;
        this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
      }
    });
  }

  saveAsNewExec(): void {
    this.currentExecId = null;
    this.saveExec();
  }

  deleteCurrentExec(): void {
    if (!this.currentExecId) return;
    if (!confirm(`Supprimer l'exec "${this.saveExecName}" ?`)) return;
    this.execService.delete(this.currentExecId).subscribe({
      next: () => {
        this.currentExecId = null;
        this.saveExecName = '';
        this.selectedLineupIds = [];
        this.loadExecsForMap(this.selectedMap!.name);
        this.snackBar.open('Exec supprimée', 'Fermer', { duration: 2500 });
      }
    });
  }
}
