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

// Représente un jeton joueur positionnable sur la map
export interface PlayerToken {
  id: string;       // identifiant unique (ex: 'ct1', 't3')
  side: 'T' | 'CT'; // équipe du joueur
  number: number;   // numéro affiché sur le jeton
  defaultX: number; // position initiale horizontale en % du conteneur
  defaultY: number; // position initiale verticale en % du conteneur
}

// Représente un jeton grenade positionnable sur la map
export interface GrenadeToken {
  id: string;                          // identifiant unique (ex: 'smoke_1', 'flash_2')
  type: 'smoke' | 'flash' | 'molotov' | 'he'; // type de grenade
  label: string;  // texte court affiché sur le jeton (ex: 'SMK')
  name: string;   // nom complet affiché dans le tooltip (ex: 'Smoke')
  defaultX: number; // position initiale en %
  defaultY: number;
}

// Définitions de base des 4 types de grenades (positions initiales, labels)
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
/** Page Playground : tableau tactique interactif avec jetons, grenades, flèches et execs */
export class PlaygroundComponent implements OnInit, AfterViewInit {
  maps = CS2_MAPS;               // liste de toutes les maps disponibles
  selectedMap: GameMap | null = null; // map actuellement affichée
  lineupCount = 0;               // nombre de lineups disponibles sur la map sélectionnée
  imageError = false;            // true si l'image radar n'a pas pu être chargée

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

  grenadeDefs = GRENADE_DEFS; // exposé au template pour la légende
  grenades: GrenadeToken[] = GRENADE_DEFS.map(d => ({ id: `${d.type}_1`, ...d })); // grenades actives sur le plateau
  grenadeCounters: Record<string, number> = Object.fromEntries(GRENADE_DEFS.map(d => [d.type, 1])); // nb de jetons par type (pour générer des IDs uniques)

  // Référence native à l'élément HTML de la zone de drag (pour calculer les coordonnées SVG)
  @ViewChild('dragZone') dragZoneRef!: ElementRef<HTMLElement>;

  dragPositions: Record<string, { x: number; y: number }> = {}; // offset CDK de chaque jeton après un drop
  livePositions: Record<string, { x: number; y: number }> = {}; // offset en temps réel pendant le drag (pour les flèches)
  selectedPlayerId: string | null = null; // ID du joueur sélectionné en mode liaison
  links: Array<{ playerId: string; grenadeId: string }> = []; // flèches joueur → grenade dessinées
  private _dragDistance = 0; // distance parcourue lors du dernier geste (pour distinguer clic et drag)

  // --- État du panneau Exec ---
  mapExecs: Exec[] = [];          // execs sauvegardées pour la map courante
  mapLineups: Lineup[] = [];      // lineups disponibles sur la map (pour l'association)
  saveExecName = '';              // nom saisi par l'utilisateur pour la sauvegarde
  selectedLineupIds: string[] = []; // IDs des lineups cochées à associer à l'exec
  currentExecId: string | null = null; // ID de l'exec chargée (null = nouvelle exec)
  execSaving = false;             // true pendant l'appel API de sauvegarde

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

  // Remet tous les offsets de drag à {x:0, y:0} pour joueurs et grenades.
  // On crée un nouvel objet pour que Angular détecte le changement de référence et re-rende le template.
  initDragPositions(): void {
    const positions: Record<string, { x: number; y: number }> = {};
    this.players.forEach(p => positions[p.id] = { x: 0, y: 0 });
    this.grenades.forEach(g => positions[g.id] = { x: 0, y: 0 });
    this.dragPositions = { ...positions };
    this.livePositions = { ...positions };
  }

  // Remet le plateau dans son état initial : grenades par défaut, flèches effacées, exec vidée
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

  // Ajoute un jeton grenade supplémentaire du type donné au plateau
  addGrenade(type: GrenadeToken['type']): void {
    const def = GRENADE_DEFS.find(d => d.type === type)!;
    this.grenadeCounters[type]++;
    const id = `${type}_${this.grenadeCounters[type]}`;
    this.grenades = [...this.grenades, { id, ...def }];
    this.dragPositions = { ...this.dragPositions, [id]: { x: 0, y: 0 } };
    this.livePositions = { ...this.livePositions, [id]: { x: 0, y: 0 } };
  }

  // Change la map active : remet tout à zéro (jetons, grenades, flèches, exec) et charge les données de la nouvelle map
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

  // Appelé à chaque frame pendant un drag : met à jour livePositions pour animer les flèches SVG en temps réel
  onTokenMoved(event: CdkDragMove, id: string): void {
    this._dragDistance = Math.hypot(event.distance.x, event.distance.y);
    const base = this.dragPositions[id] ?? { x: 0, y: 0 };
    this.livePositions = {
      ...this.livePositions,
      [id]: { x: base.x + event.distance.x, y: base.y + event.distance.y }
    };
  }

  // Appelé quand le jeton est lâché : enregistre la position finale dans dragPositions
  onTokenDropped(event: CdkDragEnd, id: string): void {
    const base = this.dragPositions[id] ?? { x: 0, y: 0 };
    const newPos = { x: base.x + event.distance.x, y: base.y + event.distance.y };
    this.dragPositions = { ...this.dragPositions, [id]: newPos };
    this.livePositions = { ...this.livePositions, [id]: newPos };
  }

  // Sélectionne ou désélectionne un joueur pour créer une flèche.
  // Ignore le clic si le geste était un drag (distance > 5px).
  onPlayerClick(id: string): void {
    if (this._dragDistance > 5) { this._dragDistance = 0; return; }
    this._dragDistance = 0;
    this.selectedPlayerId = this.selectedPlayerId === id ? null : id;
  }

  // Crée une flèche entre le joueur sélectionné et la grenade cliquée.
  // Si la flèche existe déjà, elle est supprimée (toggle).
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

  // Supprime toutes les flèches et annule la sélection en cours
  clearLinks(): void {
    this.links = [];
    this.selectedPlayerId = null;
  }

  // Clic sur le fond de la map : annule la sélection d'un joueur sans créer de flèche
  onBackgroundClick(): void {
    this.selectedPlayerId = null;
  }

  // Calcule les coordonnées pixels du centre d'un jeton pour le dessin SVG des flèches.
  // Combine la position par défaut (en %) × la taille du conteneur + l'offset live + demi-taille du jeton.
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

  // Retourne le côté (T ou CT) d'un joueur — utilisé pour déterminer la couleur de la flèche SVG
  getPlayerSide(playerId: string): 'T' | 'CT' {
    return this.players.find(p => p.id === playerId)?.side ?? 'CT';
  }

  // Indique si une grenade est une cible possible pour le joueur actuellement sélectionné (pas encore liée)
  isLinkTarget(grenadeId: string): boolean {
    if (!this.selectedPlayerId) return false;
    return !this.links.some(l => l.playerId === this.selectedPlayerId && l.grenadeId === grenadeId);
  }

  // Indique si une grenade est déjà liée au joueur sélectionné (cliquer dessus supprimera la flèche)
  isLinked(grenadeId: string): boolean {
    if (!this.selectedPlayerId) return false;
    return this.links.some(l => l.playerId === this.selectedPlayerId && l.grenadeId === grenadeId);
  }

  // --- Méthodes liées aux Execs ---

  // Charge les execs sauvegardées pour la map donnée (affichées dans le dropdown "Charger")
  loadExecsForMap(mapName: string): void {
    this.execService.getAll(mapName).subscribe({
      next: execs => this.mapExecs = execs
    });
  }

  // Charge les lineups de la map donnée (affichées dans la liste de sélection à associer)
  loadLineupsForMap(mapName: string): void {
    this.lineupService.getAll({ map: mapName }).subscribe({
      next: lineups => this.mapLineups = lineups
    });
  }

  // Restaure complètement l'état du plateau depuis une exec sauvegardée.
  // Utilisé au chargement via ?exec=id dans l'URL, ou depuis le dropdown "Charger une exec".
  loadExec(exec: Exec): void {
    const map = this.maps.find(m => m.name === exec.mapName);
    if (!map) return;

    this.selectedMap = map;
    this.imageError = false;
    this.lineupService.getAll({ map: map.name }).subscribe({
      next: lineups => this.lineupCount = lineups.length
    });

    // Désérialise le snapshot JSON et restaure chaque partie de l'état
    const snapshot: ExecSnapshot = JSON.parse(exec.snapshotJson);
    this.grenades = snapshot.grenades;
    this.grenadeCounters = { ...snapshot.grenadeCounters };
    this.dragPositions = { ...snapshot.dragPositions };
    this.livePositions = { ...snapshot.dragPositions }; // idem dragPositions au départ
    this.links = [...snapshot.links];
    this.selectedPlayerId = null;

    // Recharge le contexte du panneau exec
    this.currentExecId = exec.id;
    this.saveExecName = exec.name;
    this.selectedLineupIds = exec.lineups.map(l => l.id);

    this.loadExecsForMap(map.name);
    this.loadLineupsForMap(map.name);
  }

  // Sérialise l'état actuel du plateau en JSON (positions, grenades, flèches) pour la sauvegarde
  buildSnapshot(): string {
    const snapshot: ExecSnapshot = {
      dragPositions: { ...this.dragPositions },
      grenadeCounters: { ...this.grenadeCounters },
      grenades: this.grenades.map(g => ({ ...g })),
      links: [...this.links]
    };
    return JSON.stringify(snapshot);
  }

  // Sauvegarde l'exec courante : mise à jour si currentExecId existe, création sinon
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

  // Force la création d'une nouvelle exec sans écraser celle actuellement chargée
  saveAsNewExec(): void {
    this.currentExecId = null;
    this.saveExec();
  }

  // Supprime l'exec courante après confirmation et remet le panneau à vide
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
