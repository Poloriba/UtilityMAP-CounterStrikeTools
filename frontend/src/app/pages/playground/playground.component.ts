import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
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
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { CS2_MAPS, GameMap } from '../../models/map.model';
import { Lineup } from '../../models/lineup.model';
import { UTILITY_COLORS_LIGHT } from '../../models/utility-colors';
import { Exec, ExecRequest, ExecSnapshot } from '../../models/exec.model';
import { LineupService } from '../../services/lineup.service';
import { ExecService } from '../../services/exec.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

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
    MatListModule, MatSnackBarModule, MatDividerModule,
    MatMenuModule, MatDialogModule, OverlayModule
  ],
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss']
})
/** Page Playground : tableau tactique interactif avec jetons, grenades, flèches et execs */
export class PlaygroundComponent implements OnInit {
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
  // Référence à l'entièreté de l'affichage map (radar + jetons + flèches) utilisée pour l'export PNG
  @ViewChild('mapDisplay') mapDisplayRef!: ElementRef<HTMLElement>;

  dragPositions: Record<string, { x: number; y: number }> = {}; // offset CDK de chaque jeton après un drop
  livePositions: Record<string, { x: number; y: number }> = {}; // offset en temps réel pendant le drag (pour les flèches)
  selectedPlayerId: string | null = null; // ID du joueur sélectionné en mode liaison
  links: Array<{ playerId: string; grenadeId: string; lineupId?: string }> = []; // flèches joueur → grenade dessinées
  deadPlayerIds: string[] = []; // IDs des joueurs actuellement éliminés (retirés du plateau)

  // --- Undo / Redo ---
  private history: Array<{
    dragPositions: Record<string, { x: number; y: number }>;
    grenades: GrenadeToken[];
    grenadeCounters: Record<string, number>;
    links: Array<{ playerId: string; grenadeId: string; lineupId?: string }>;
    deadPlayerIds: string[];
  }> = [];
  private historyIndex = -1;
  private readonly MAX_HISTORY = 50;

  get canUndo(): boolean { return this.historyIndex > 0; }
  get canRedo(): boolean { return this.historyIndex < this.history.length - 1; }

  // --- État du popup lineup (survol d'une flèche liée) ---
  hoveredLink: { playerId: string; grenadeId: string; lineupId?: string } | null = null; // lien survolé
  hoveredLineup: Lineup | null = null; // lineup résolue pour l'affichage du popup
  popupPos = { x: 0, y: 0 }; // position du popup en pixels (fixed, suit le curseur)
  menuPos = { x: 0, y: 0 }; // position du trigger du menu picker dans la drag zone

  // --- Sélecteur de lineup pour un lien ---
  linkMenuTarget: { playerId: string; grenadeId: string; lineupId?: string } | null = null; // lien cible du menu contextuel
  linkMenuLineups: Lineup[] = []; // lineups filtrées pour le type de grenade du lien
  private _dragDistance = 0; // distance parcourue lors du dernier geste (pour distinguer clic et drag)

  // Joueurs encore en vie sur le plateau (filtrés en temps réel)
  get alivePlayers(): PlayerToken[] {
    return this.players.filter(p => !this.deadPlayerIds.includes(p.id));
  }

  // Joueurs éliminés, affichés dans le banc pour pouvoir les réanimer
  get deadPlayers(): PlayerToken[] {
    return this.players.filter(p => this.deadPlayerIds.includes(p.id));
  }

  // --- État du panneau Exec ---
  mapExecs: Exec[] = [];          // execs sauvegardées pour la map courante
  mapLineups: Lineup[] = [];      // lineups disponibles sur la map (pour l'association)
  saveExecName = '';              // nom saisi par l'utilisateur pour la sauvegarde
  selectedLineupIds: string[] = []; // IDs des lineups cochées à associer à l'exec
  currentExecId: string | null = null; // ID de l'exec chargée (null = nouvelle exec)
  execSaving = false;             // true pendant l'appel API de sauvegarde

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly lineupService: LineupService,
    private readonly execService: ExecService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
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

  // --- Undo / Redo : raccourcis clavier ---
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'z') {
      event.preventDefault();
      this.undo();
    } else if (event.ctrlKey && event.key === 'y') {
      event.preventDefault();
      this.redo();
    }
  }

  // Capture un snapshot de l'état du plateau dans l'historique
  private pushHistory(): void {
    const snapshot = {
      dragPositions: { ...this.dragPositions },
      grenades: this.grenades.map(g => ({ ...g })),
      grenadeCounters: { ...this.grenadeCounters },
      links: this.links.map(l => ({ ...l })),
      deadPlayerIds: [...this.deadPlayerIds],
    };
    // Supprime les entrées après l'index courant (on écrase le futur)
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(snapshot);
    // Limite la taille de l'historique
    if (this.history.length > this.MAX_HISTORY) {
      this.history.shift();
    }
    this.historyIndex = this.history.length - 1;
  }

  // Restaure un snapshot donné sur le plateau
  private restoreSnapshot(snapshot: typeof this.history[0]): void {
    this.dragPositions = { ...snapshot.dragPositions };
    this.livePositions = { ...snapshot.dragPositions };
    this.grenades = snapshot.grenades.map(g => ({ ...g }));
    this.grenadeCounters = { ...snapshot.grenadeCounters };
    this.links = snapshot.links.map(l => ({ ...l }));
    this.deadPlayerIds = [...snapshot.deadPlayerIds];
    this.selectedPlayerId = null;
  }

  undo(): void {
    if (!this.canUndo) return;
    this.historyIndex--;
    this.restoreSnapshot(this.history[this.historyIndex]);
  }

  redo(): void {
    if (!this.canRedo) return;
    this.historyIndex++;
    this.restoreSnapshot(this.history[this.historyIndex]);
  }

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
    this.deadPlayerIds = [];
    this.selectedPlayerId = null;
    this.currentExecId = null;
    this.saveExecName = '';
    this.selectedLineupIds = [];
    this.initDragPositions();
    this.pushHistory();
  }

  // Ajoute un jeton grenade supplémentaire du type donné au plateau
  addGrenade(type: GrenadeToken['type']): void {
    const def = GRENADE_DEFS.find(d => d.type === type)!;
    this.grenadeCounters[type]++;
    const id = `${type}_${this.grenadeCounters[type]}`;
    this.grenades = [...this.grenades, { id, ...def }];
    this.dragPositions = { ...this.dragPositions, [id]: { x: 0, y: 0 } };
    this.livePositions = { ...this.livePositions, [id]: { x: 0, y: 0 } };
    this.pushHistory();
  }

  // Supprime un jeton grenade du plateau et nettoie les flèches qui le relient
  removeGrenade(id: string): void {
    this.grenades = this.grenades.filter(g => g.id !== id);
    this.links = this.links.filter(l => l.grenadeId !== id);
    const { [id]: _dp, ...restDp } = this.dragPositions;
    const { [id]: _lp, ...restLp } = this.livePositions;
    this.dragPositions = restDp;
    this.livePositions = restLp;
    if (this.selectedPlayerId) {
      // annule la sélection si la grenade ciblée vient d'être supprimée
      this.selectedPlayerId = null;
    }
    this.pushHistory();
  }

  // Retire un joueur du plateau (éliminé) et supprime ses flèches
  killPlayer(id: string): void {
    if (!this.deadPlayerIds.includes(id)) {
      this.deadPlayerIds = [...this.deadPlayerIds, id];
    }
    this.links = this.links.filter(l => l.playerId !== id);
    if (this.selectedPlayerId === id) this.selectedPlayerId = null;
    this.pushHistory();
  }

  // Remet un joueur éliminé en jeu, à sa position par défaut
  revivePlayer(id: string): void {
    this.deadPlayerIds = this.deadPlayerIds.filter(pid => pid !== id);
    this.dragPositions = { ...this.dragPositions, [id]: { x: 0, y: 0 } };
    this.livePositions = { ...this.livePositions, [id]: { x: 0, y: 0 } };
    this.pushHistory();
  }

  // Change la map active : remet tout à zéro (jetons, grenades, flèches, exec) et charge les données de la nouvelle map
  selectMap(map: GameMap): void {
    this.selectedMap = map;
    this.imageError = false;
    this.lineupCount = 0;
    this.links = [];
    this.deadPlayerIds = [];
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
    // Réinitialise l'historique pour la nouvelle map
    this.history = [];
    this.historyIndex = -1;
    this.pushHistory();
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
    this.pushHistory();
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
    this.pushHistory();
  }

  // Supprime toutes les flèches et annule la sélection en cours
  clearLinks(): void {
    this.links = [];
    this.selectedPlayerId = null;
    this.pushHistory();
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

  // --- Méthodes liées aux Lineups sur les liens ---

  // Retourne la lineup associée à un lien (lookup rapide dans mapLineups)
  getLinkedLineup(lineupId: string | undefined): Lineup | undefined {
    if (!lineupId) return undefined;
    return this.mapLineups.find(l => l.id === lineupId);
  }

  // Retourne le type de grenade d'un lien
  getGrenadeType(grenadeId: string): string {
    return this.grenades.find(g => g.id === grenadeId)?.type ?? '';
  }

  // Clic gauche sur une flèche : ouvre le menu de sélection de lineup positionné au curseur
  onLinkRightClick(event: MouseEvent, link: { playerId: string; grenadeId: string; lineupId?: string }, trigger: MatMenuTrigger): void {
    event.stopPropagation();
    // Positionne le trigger invisible par rapport à la drag zone
    const zone = this.dragZoneRef.nativeElement;
    const rect = zone.getBoundingClientRect();
    this.menuPos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    this.onLinkMouseLeave(); // ferme le popup de preview
    // Prépare le menu
    const grenadeType = this.getGrenadeType(link.grenadeId)?.toUpperCase();
    this.linkMenuTarget = link;
    this.linkMenuLineups = this.mapLineups.filter(l => l.utilityType === grenadeType);
    // Ouvre le menu au prochain tick (après que le trigger ait bougé)
    setTimeout(() => trigger.openMenu());
  }

  // Ouvre le menu de sélection de lineup pour un lien donné
  openLineupPicker(link: { playerId: string; grenadeId: string; lineupId?: string }, trigger: MatMenuTrigger): void {
    const grenadeType = this.getGrenadeType(link.grenadeId)?.toUpperCase();
    this.linkMenuTarget = link;
    this.linkMenuLineups = this.mapLineups.filter(l => l.utilityType === grenadeType);
    trigger.openMenu();
  }

  // Associe une lineup au lien ciblé
  assignLineupToLink(lineup: Lineup): void {
    if (!this.linkMenuTarget) return;
    this.links = this.links.map(l =>
      l.playerId === this.linkMenuTarget!.playerId && l.grenadeId === this.linkMenuTarget!.grenadeId
        ? { ...l, lineupId: lineup.id }
        : l
    );
    this.linkMenuTarget = null;
  }

  // Retire l'association lineup d'un lien
  removeLineupFromLink(): void {
    if (!this.linkMenuTarget) return;
    this.links = this.links.map(l =>
      l.playerId === this.linkMenuTarget!.playerId && l.grenadeId === this.linkMenuTarget!.grenadeId
        ? { playerId: l.playerId, grenadeId: l.grenadeId }
        : l
    );
    this.linkMenuTarget = null;
  }

  // Affiche le popup lineup au survol d'une flèche SVG
  onLinkMouseEnter(link: { playerId: string; grenadeId: string; lineupId?: string }, event: MouseEvent): void {
    if (!link.lineupId) return;
    const lineup = this.getLinkedLineup(link.lineupId);
    if (!lineup) return;
    this.hoveredLink = link;
    this.hoveredLineup = lineup;
    this.popupPos = { x: event.clientX + 12, y: event.clientY + 12 };
  }

  // Met à jour la position du popup pendant le survol
  onLinkMouseMove(event: MouseEvent): void {
    if (!this.hoveredLineup) return;
    this.popupPos = { x: event.clientX + 12, y: event.clientY + 12 };
  }

  // Ferme le popup lineup
  onLinkMouseLeave(): void {
    this.hoveredLink = null;
    this.hoveredLineup = null;
  }

  // Retourne la couleur de la flèche selon le type de grenade liée ou le côté du joueur
  getLinkStroke(link: { playerId: string; grenadeId: string; lineupId?: string }): string {
    if (link.lineupId) {
      const type = this.getGrenadeType(link.grenadeId);
      return UTILITY_COLORS_LIGHT[type] ?? (this.getPlayerSide(link.playerId) === 'CT' ? '#42a5f5' : '#ffa726');
    }
    return this.getPlayerSide(link.playerId) === 'CT' ? '#42a5f5' : '#ffa726';
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
    this.deadPlayerIds = [...(snapshot.deadPlayerIds ?? [])];
    this.selectedPlayerId = null;

    // Recharge le contexte du panneau exec
    this.currentExecId = exec.id;
    this.saveExecName = exec.name;
    this.selectedLineupIds = exec.lineups.map(l => l.id);

    this.loadExecsForMap(map.name);
    this.loadLineupsForMap(map.name);
    // Réinitialise l'historique pour l'exec chargée
    this.history = [];
    this.historyIndex = -1;
    this.pushHistory();
  }

  // Sérialise l'état actuel du plateau en JSON (positions, grenades, flèches, éliminés) pour la sauvegarde
  buildSnapshot(): string {
    const snapshot: ExecSnapshot = {
      dragPositions: { ...this.dragPositions },
      grenadeCounters: { ...this.grenadeCounters },
      grenades: this.grenades.map(g => ({ ...g })),
      links: [...this.links],
      deadPlayerIds: [...this.deadPlayerIds]
    };
    return JSON.stringify(snapshot);
  }

  // Sauvegarde l'exec courante : mise à jour si currentExecId existe, création sinon
  saveExec(successMessage = 'Exec sauvegardée !'): void {
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
        this.snackBar.open(successMessage, 'Fermer', { duration: 2500 });
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

  // Duplique l'exec courante : préfixe le nom avec "Copie de" et crée une nouvelle exec
  duplicateCurrentExec(): void {
    if (!this.currentExecId) return;
    const originalName = this.saveExecName;
    this.saveExecName = `Copie de ${originalName}`;
    this.currentExecId = null; // force la création d'une nouvelle exec
    this.saveExec(`« Copie de ${originalName} » créée !`);
  }

  // Supprime l'exec courante après confirmation et remet le panneau à vide
  deleteCurrentExec(): void {
    if (!this.currentExecId) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer l\u2019exec',
        message: `Voulez-vous vraiment supprimer l'exec \u00ab ${this.saveExecName} \u00bb ?`
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.execService.delete(this.currentExecId!).subscribe({
        next: () => {
          this.currentExecId = null;
          this.saveExecName = '';
          this.selectedLineupIds = [];
          this.loadExecsForMap(this.selectedMap!.name);
          this.snackBar.open('Exec supprim\u00e9e', 'Fermer', { duration: 2500 });
        },
        error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 })
      });
    });
  }

  // Couleurs des grenades pour l'export canvas (référence centralisée)
  private readonly GRENADE_COLORS = UTILITY_COLORS_LIGHT;

  // Dessine un jeton rond (joueur) sur le canvas
  private drawPlayerToken(ctx: CanvasRenderingContext2D, player: PlayerToken, x: number, y: number, size: number): void {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = player.side === 'CT' ? '#1565c0' : '#bf360c';
    ctx.fill();
    ctx.strokeStyle = player.side === 'CT' ? '#42a5f5' : '#ffa726';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${size * 0.45}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(player.number), cx, cy);
    ctx.restore();
  }

  // Dessine un jeton carré arrondi (grenade) sur le canvas
  private drawGrenadeToken(ctx: CanvasRenderingContext2D, grenade: GrenadeToken, x: number, y: number, size: number): void {
    const r = 6;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + size - r, y);   ctx.arcTo(x + size, y, x + size, y + r, r);
    ctx.lineTo(x + size, y + size - r); ctx.arcTo(x + size, y + size, x + size - r, y + size, r);
    ctx.lineTo(x + r, y + size);   ctx.arcTo(x, y + size, x, y + size - r, r);
    ctx.lineTo(x, y + r);          ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.fillStyle = this.GRENADE_COLORS[grenade.type] ?? '#888';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${size * 0.35}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(grenade.label, x + size / 2, y + size / 2);
    ctx.restore();
  }

  // Dessine une flèche en pointillés entre deux points sur le canvas
  private drawArrow(ctx: CanvasRenderingContext2D, from: {x: number, y: number}, to: {x: number, y: number}, color: string): void {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLen = 10;
    // Raccourcit la ligne pour ne pas passer sous la pointe
    const endX = to.x - Math.cos(angle) * headLen * 0.5;
    const endY = to.y - Math.sin(angle) * headLen * 0.5;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    // Pointe pleine
    ctx.setLineDash([]);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.translate(to.x, to.y);
    ctx.rotate(angle);
    ctx.moveTo(0, 0);
    ctx.lineTo(-headLen, -headLen / 2.5);
    ctx.lineTo(-headLen, headLen / 2.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Génère et télécharge un PNG amélioré : header (nom exec + map), map avec tokens, légende automatique.
  exporting = false;
  async exportPng(): Promise<void> {
    if (!this.dragZoneRef) return;
    this.exporting = true;

    try {
      const zone = this.dragZoneRef.nativeElement;
      const mapW = zone.offsetWidth;
      const mapH = zone.offsetHeight;
      const scale = 2;
      const TOKEN_SIZE = 32;

      // Dimensions de l'image finale
      const PADDING = 24;
      const HEADER_H = 56;
      const LEGEND_LINE_H = 22;
      const LEGEND_PADDING = 16;

      // Construire la légende : lineups liées
      const linkedLineups = this.links
        .filter(l => l.lineupId)
        .map(l => {
          const lineup = this.mapLineups.find(ml => ml.id === l.lineupId);
          return lineup ? { type: lineup.utilityType, name: lineup.name } : null;
        })
        .filter(Boolean) as { type: string; name: string }[];
      // Déduplique
      const uniqueLineups = linkedLineups.filter(
        (l, i, arr) => arr.findIndex(a => a.name === l.name) === i
      );

      const legendLines = uniqueLineups.length;
      const legendH = legendLines > 0 ? LEGEND_PADDING * 2 + legendLines * LEGEND_LINE_H + 30 : 60;
      const totalW = mapW + PADDING * 2;
      const totalH = HEADER_H + mapH + legendH + PADDING * 2;

      const canvas = document.createElement('canvas');
      canvas.width = totalW * scale;
      canvas.height = totalH * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(scale, scale);

      // ===== FOND GLOBAL =====
      ctx.fillStyle = '#121218';
      ctx.fillRect(0, 0, totalW, totalH);

      // ===== HEADER =====
      ctx.fillStyle = '#1b1b2f';
      ctx.fillRect(0, 0, totalW, HEADER_H);

      // Logo icône
      ctx.fillStyle = '#e67e22';
      ctx.font = 'bold 18px sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText('◎', PADDING, HEADER_H / 2);

      // Nom de la map
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      const mapName = this.selectedMap?.name ?? 'Map';
      ctx.fillText(mapName, PADDING + 24, HEADER_H / 2);

      // Nom de l'exec
      const execName = this.saveExecName.trim() || 'Playground';
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '13px sans-serif';
      const execTextW = ctx.measureText(execName).width;
      ctx.fillText(execName, totalW - PADDING - execTextW, HEADER_H / 2);

      // Séparateur sous le header
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(0, HEADER_H - 2, totalW, 2);

      // ===== MAP ZONE =====
      const mapX = PADDING;
      const mapY = HEADER_H + PADDING;

      // Fond de la map
      ctx.fillStyle = this.selectedMap?.color ?? '#1a1a2e';
      ctx.fillRect(mapX, mapY, mapW, mapH);

      // Image radar
      if (!this.imageError && this.selectedMap) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = this.selectedMap!.radarUrl;
        });
        if (img.complete && img.naturalWidth > 0) {
          const scale_img = Math.min(mapW / img.naturalWidth, mapH / img.naturalHeight);
          const dw = img.naturalWidth * scale_img;
          const dh = img.naturalHeight * scale_img;
          const dx = mapX + (mapW - dw) / 2;
          const dy = mapY + (mapH - dh) / 2;
          ctx.drawImage(img, dx, dy, dw, dh);
        }
      }

      // Flèches
      for (const link of this.links) {
        const from = this.getTokenCenter(link.playerId);
        const to = this.getTokenCenter(link.grenadeId);
        const offsetFrom = { x: mapX + from.x, y: mapY + from.y };
        const offsetTo = { x: mapX + to.x, y: mapY + to.y };
        const sideColor = this.getPlayerSide(link.playerId) === 'CT' ? '#42a5f5' : '#ffa726';
        const color = link.lineupId
          ? (this.GRENADE_COLORS[this.getGrenadeType(link.grenadeId)] ?? '#ffd740')
          : sideColor;
        this.drawArrow(ctx, offsetFrom, offsetTo, color);
      }

      // Joueurs
      for (const player of this.alivePlayers) {
        const live = this.livePositions[player.id] ?? { x: 0, y: 0 };
        const x = mapX + (player.defaultX / 100) * mapW + live.x;
        const y = mapY + (player.defaultY / 100) * mapH + live.y;
        this.drawPlayerToken(ctx, player, x, y, TOKEN_SIZE);
      }

      // Grenades
      for (const grenade of this.grenades) {
        const live = this.livePositions[grenade.id] ?? { x: 0, y: 0 };
        const x = mapX + (grenade.defaultX / 100) * mapW + live.x;
        const y = mapY + (grenade.defaultY / 100) * mapH + live.y;
        this.drawGrenadeToken(ctx, grenade, x, y, TOKEN_SIZE);
      }

      // ===== LÉGENDE =====
      this.drawExportLegend(ctx, mapY + mapH + PADDING, PADDING, uniqueLineups);

      // Watermark
      ctx.fillStyle = '#555';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('UtilityMAP CS2', totalW - PADDING, totalH - 8);
      ctx.textAlign = 'left';

      // ===== TÉLÉCHARGEMENT =====
      const safeName = `${mapName}_${execName}`.replaceAll(/[^a-z0-9_-]/gi, '_');
      const link = document.createElement('a');
      link.download = `${safeName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      this.snackBar.open('Export PNG téléchargé !', 'Fermer', { duration: 2500 });
    } catch (err) {
      console.error('Erreur export PNG', err);
      this.snackBar.open('Erreur lors de l\'export', 'Fermer', { duration: 3000 });
    } finally {
      this.exporting = false;
    }
  }

  private drawExportLegend(
    ctx: CanvasRenderingContext2D,
    legendY: number,
    padding: number,
    uniqueLineups: { type: string; name: string }[]
  ): void {
    const LEGEND_LINE_H = 22;
    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.textBaseline = 'middle';
    const playerLegendY = legendY + 10;

    // CT
    ctx.beginPath();
    ctx.arc(padding + 6, playerLegendY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#42a5f5';
    ctx.fill();
    ctx.fillStyle = '#ccc';
    ctx.fillText('CT', padding + 16, playerLegendY);

    // T
    ctx.beginPath();
    ctx.arc(padding + 50, playerLegendY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffa726';
    ctx.fill();
    ctx.fillStyle = '#ccc';
    ctx.fillText('T', padding + 60, playerLegendY);

    // Grenades legend
    const grenadeTypes: Array<{ type: string; label: string; color: string }> = [
      { type: 'smoke', label: 'Smoke', color: this.GRENADE_COLORS['smoke'] },
      { type: 'flash', label: 'Flash', color: this.GRENADE_COLORS['flash'] },
      { type: 'molotov', label: 'Molotov', color: this.GRENADE_COLORS['molotov'] },
      { type: 'he', label: 'HE', color: this.GRENADE_COLORS['he'] },
    ];
    let gx = padding + 100;
    for (const gt of grenadeTypes) {
      ctx.fillStyle = gt.color;
      ctx.fillRect(gx, playerLegendY - 5, 10, 10);
      ctx.fillStyle = '#ccc';
      ctx.font = '11px sans-serif';
      ctx.fillText(gt.label, gx + 14, playerLegendY);
      gx += ctx.measureText(gt.label).width + 30;
    }

    // Lineups associées
    if (uniqueLineups.length > 0) {
      const lineupsStartY = playerLegendY + 24;
      ctx.fillStyle = '#ffd740';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Lineups associées :', padding, lineupsStartY);

      ctx.font = '12px sans-serif';
      uniqueLineups.forEach((l, i) => {
        const ly = lineupsStartY + 20 + i * LEGEND_LINE_H;
        const typeColor = this.GRENADE_COLORS[l.type.toLowerCase()] ?? '#888';
        ctx.fillStyle = typeColor;
        ctx.fillRect(padding, ly - 5, 8, 12);
        ctx.fillStyle = '#aaa';
        ctx.fillText(l.type, padding + 14, ly + 1);
        ctx.fillStyle = '#e0e0e0';
        ctx.fillText(l.name, padding + 70, ly + 1);
      });
    }
  }
}
