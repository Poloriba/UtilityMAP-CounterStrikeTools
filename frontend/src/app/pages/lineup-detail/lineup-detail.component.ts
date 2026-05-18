import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Lineup } from '../../models/lineup.model';
import { UTILITY_COLORS } from '../../models/utility-colors';
import { CS2_MAPS, SIDE_ICONS, GRENADE_ICONS } from '../../models/map.model';
import { Exec } from '../../models/exec.model';
import { LineupService } from '../../services/lineup.service';
import { FavoriteService } from '../../services/favorite.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ExecService } from '../../services/exec.service';

@Component({
  selector: 'app-lineup-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatDividerModule, MatSnackBarModule, MatDialogModule,
    MatFormFieldModule, MatSelectModule, MatTooltipModule
  ],
  templateUrl: './lineup-detail.component.html',
  styleUrls: ['./lineup-detail.component.scss']
})
/** Page de détail d'une lineup : affichage, favori, édition, suppression, ajout à une exec */
export class LineupDetailComponent implements OnInit {
  lineup?: Lineup;                    // lineup chargée depuis l'API
  loading = false;                    // indicateur de chargement initial
  mapExecs: Exec[] = [];              // execs disponibles sur la même map (pour l'association)
  selectedExecId: string | null = null; // exec sélectionnée dans le dropdown d'association

  // Couleurs associées à chaque type de grenade (utilisées dans le template)
  typeColors = UTILITY_COLORS;
  sideIcons = SIDE_ICONS;
  grenadeIcons = GRENADE_ICONS;
  maps = CS2_MAPS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lineupService: LineupService,
    private favoriteService: FavoriteService,
    private execService: ExecService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      // Charge la lineup puis les execs disponibles sur la même map
      this.lineupService.getById(id).subscribe({
        next: lineup => {
          this.lineup = lineup;
          this.loading = false;
          this.execService.getAll(lineup.mapName).subscribe({
            next: execs => this.mapExecs = execs
          });
        },
        error: () => {
          this.snackBar.open('Lineup introuvable', 'Fermer', { duration: 3000 });
          this.router.navigate(['/lineups']);
        }
      });
    }
  }

  // Ajoute ou retire la lineup des favoris de l'utilisateur courant
  toggleFavorite(): void {
    if (!this.lineup) return;
    const action$ = this.lineup.favorite
      ? this.favoriteService.removeFavorite(this.lineup.id)
      : this.favoriteService.addFavorite(this.lineup.id);

    action$.subscribe({
      next: () => {
        this.lineup!.favorite = !this.lineup!.favorite;
        this.snackBar.open(
          this.lineup!.favorite ? 'Ajouté aux favoris' : 'Retiré des favoris',
          '', { duration: 2000 }
        );
      },
      error: () => this.snackBar.open('Erreur lors de la mise à jour des favoris', 'Fermer', { duration: 3000 })
    });
  }

  // Supprime la lineup après confirmation et retourne à la liste
  deleteLineup(): void {
    if (!this.lineup) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer la lineup',
        message: `Voulez-vous vraiment supprimer la lineup \u00ab ${this.lineup.name} \u00bb ?`
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.lineupService.delete(this.lineup!.id).subscribe({
        next: () => {
          this.snackBar.open('Lineup supprim\u00e9e', '', { duration: 2000 });
          this.router.navigate(['/lineups']);
        },
        error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 })
      });
    });
  }

  // Associe cette lineup à l'exec sélectionnée dans le dropdown
  addToExec(): void {
    if (!this.lineup || !this.selectedExecId) return;
    this.execService.addLineup(this.selectedExecId, this.lineup.id).subscribe({
      next: updated => {
        const exec = this.mapExecs.find(e => e.id === updated.id);
        if (exec) exec.lineups = updated.lineups;
        this.snackBar.open('Lineup ajoutée à l\'exec !', 'Fermer', { duration: 2500 });
        this.selectedExecId = null;
      },
      error: () => this.snackBar.open('Erreur lors de l\'ajout', 'Fermer', { duration: 3000 })
    });
  }

  getMapIcon(mapName: string): string {
    return this.maps.find(m => m.name === mapName)?.iconUrl ?? '';
  }
}
